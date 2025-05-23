import os
import logging
from flask import jsonify

from services import PoseProcessingService, SegmentationService, VideoService, UserService, ProjectService, BVHService

class PoseController:
    def __init__(self):
        self.pose_processing_service = PoseProcessingService()
        self.segmentation_service = SegmentationService()

    def convert_video_to_bvh(self, temp_video_path, x_sensitivity, y_sensitivity):
        """
        Processes a single video and converts it to BVH format.
            :param temp_video_path: Path to the video file
            :return: BVH filename if successful, None otherwise
        """
        try:
            bvh_filename = self.pose_processing_service.convert_video_to_bvh(temp_video_path, x_sensitivity, y_sensitivity)
            if bvh_filename:
                return bvh_filename
            
            return None
        
        except Exception as e:
            logging.error(f"Error in process_video: {e}")
            return None
        
        finally:
            if temp_video_path and os.path.exists(temp_video_path):
                os.remove(temp_video_path)  # Ensure file cleanup

    def segment_people_into_separate_videos(self, video_path, x_sensitivity, y_sensitivity):
        """
        Handles segmentation and passes segmented videos for further processing.
        :param video_path: Path to the video file
        :return: List of BVH filenames if successful, None otherwise
        """
        try:
            output_video_paths = self.segmentation_service.segment_video(video_path)
            if not output_video_paths:
                print("No segmented videos found")
                return None, "Error in segmentation"

            # Process segmented videos
            print("Processing segmented videos...")
            bvh_filenames = self.process_segmented_videos(output_video_paths, video_path, x_sensitivity, y_sensitivity)

            return bvh_filenames, None

        except Exception as e:
            print(f"Error in multiple_human_segmentation: {e}")
            logging.error(f"Error in multiple_human_segmentation: {e}")
            return None, "Error in segmentation"

    def process_segmented_videos(self, output_video_paths, original_video_path, x_sensitivity, y_sensitivity):
        """
        Processes each segmented video and converts it to BVH if it meets the frame count criteria.
        :param output_video_paths: List of paths to segmented videos
        """
        bvh_filenames = []
        total_frames = VideoService.get_video_frame_count(original_video_path)

        for segmented_video_path in output_video_paths:
            frames_num = VideoService.get_video_frame_count(segmented_video_path)

            if frames_num < 0.4 * total_frames:
                os.remove(segmented_video_path)
                continue

            print("Converting Video to BVH:", segmented_video_path)
            bvh_filename = self.convert_video_to_bvh(segmented_video_path, x_sensitivity, y_sensitivity)

            if bvh_filename:  # Ensure only valid BVH files are added
                bvh_filenames.append(bvh_filename)

        return bvh_filenames

    def process_request(self, request):
        """
        Handles API requests (assuming request contains a video path).
        :param request: Flask request object
        :return: JSON response
        """
        try:
            video = request.files.get("video")
            project_name = request.form.get("projectName")
            user_id = request.form.get("userId")   
            x_sensitivity = request.form.get("xSensitivity")
            y_sensitivity = request.form.get("ySensitivity")

            if not video or not project_name or not user_id:
                return jsonify({"success": False, "message": "Missing required fields"}), 400
            
            if not x_sensitivity or not y_sensitivity:
                return jsonify({"success": False, "message": "Missing required fields"}), 400
            
            try:
                x_sensitivity = float(x_sensitivity)
                y_sensitivity = float(y_sensitivity)
                
                # Validate that values are within expected range (0-1)
                if not (0 <= x_sensitivity <= 1) or not (0 <= y_sensitivity <= 1):
                    return jsonify({"success": False, "message": "Sensitivity values must be between 0 and 1"}), 400
                    
            except ValueError:
                print(f"Invalid sensitivity values: {x_sensitivity}, {y_sensitivity}")
                return jsonify({"success": False, "message": "Invalid sensitivity values"}), 400
            
            # Check if user exists
            if not UserService.does_user_exist_by_id(user_id):
                return jsonify({"success": False, "message": "User not found"}), 404
            
            # Check if User is verified
            errors = UserService.check_user_verification(user_id)
            if errors:
                return jsonify({"success": False, "message": errors["message"]}), 403
            
            # Check for duplicate project name
            existing_project = ProjectService.get_project_by_name_and_user_id(project_name, user_id)
            if existing_project:
                return jsonify({"success": False, "message": "Project name already exists"}), 200
            
            print("Handling video upload...")
            
            temp_video_path, error_message = VideoService.handle_video_upload(video, request.files)
            if not temp_video_path:
                return jsonify({"success": False, "message": error_message}), 400

            print("Video uploaded successfully. Processing...")
            
            # Creating Project
            project = ProjectService.create_project({"projectName": project_name, "userId": user_id})
            if not project:
                return jsonify({"success": False, "message": "Error creating project"}), 500
            
            print("Project created successfully. Segmenting video...")

            # Segmenting and Processing Video
            bvh_filenames, message = self.segment_people_into_separate_videos(temp_video_path, x_sensitivity, y_sensitivity)
            
            print("Video segmented successfully. Converting to BVH...")

            # Error Handling
            if not bvh_filenames:
                print("No valid BVH files found. Deleting project...")
                ProjectService.delete_project(project["id"], user_id)
                return jsonify({"success": False, "message": message}), 500
            
            print("BVH files created successfully. Saving to database...")
            for i, bvh_filename in enumerate(bvh_filenames):
                print(f"BVH file {i + 1}/{len(bvh_filenames)}: {bvh_filename}")
            
            # Creating BVH Files
            if BVHService.create_bvhs(bvh_filenames, project["id"]):
                print("BVH files saved successfully.")
                ProjectService.update_project_status(project_name, user_id, False)
                return jsonify({"success": True, "data": {"bvh_filenames": bvh_filenames, "projectId": project["id"]}}), 200
            
            print("Error saving BVH files. Deleting project...")
            ProjectService.delete_project(project["id"], user_id)
            return jsonify({"success": False, "message": "Error processing video"}), 500
        
        except Exception as e:
            print(f"Error in process_request: {e}")
            return jsonify({"success": False, "message": str(e)}), 500
