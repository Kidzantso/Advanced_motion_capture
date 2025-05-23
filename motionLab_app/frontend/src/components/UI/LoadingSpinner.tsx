import React from 'react';

interface LoadingSpinnerProps {
    size?: number;
    extraStyles?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 24,
    extraStyles = "",
}) => {
    return (
        <div className="flex justify-center">
            <svg
                className={`text-purple-500 animate-spin ${extraStyles}`}
                width={size}
                height={size}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                ></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                ></path>
            </svg>
        </div>
    );
};

export default LoadingSpinner;
