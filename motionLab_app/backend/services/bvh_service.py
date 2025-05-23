from models.bvh_model import BVH
import os

class BVHService:
    
    @staticmethod
    def create_bvhs(filenames, project_id):
        try:
            for filename in filenames:
                bvh = BVH.create(filename, project_id)
                if not bvh:
                    return False
            
            return True
        except Exception as e:
            return False
        
    @staticmethod
    def delete_bvhs_by_project_id(project_id):
        try:
            bvh_filenames = BVH.delete_bvhs_by_project_id(project_id)
            if not bvh_filenames:
                return False
            
            for filename in bvh_filenames:
                os.remove(os.path.join("BVHs", filename))
                
            return True
        except Exception as e:
            return False
        
    @staticmethod
    def get_bvhs_by_project_id(project_id):
        bvhs = BVH.get_by_project_id(project_id)
        if not bvhs:
            return None
        
        return [bvh.to_dict() for bvh in bvhs]