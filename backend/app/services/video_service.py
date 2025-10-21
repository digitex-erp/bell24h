import cloudinary
import cloudinary.uploader
from moviepy.editor import VideoFileClip, AudioFileClip
from face_detection import build_detector
from pydub import AudioSegment
import numpy as np
import tempfile
import os
from typing import Dict, Any, Optional
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

class VideoService:
    def __init__(self):
        self.detector = build_detector(
            "RetinaNet",
            min_confidence=0.5
        )

    async def process_rfq_video(
        self,
        video_file: str,
        mask_identity: bool = True
    ) -> Dict[str, Any]:
        """Process RFQ video with identity protection"""
        try:
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_video = os.path.join(temp_dir, "temp_video.mp4")
                processed_video = os.path.join(temp_dir, "processed.mp4")
                
                # Save uploaded file
                with open(temp_video, "wb") as f:
                    f.write(video_file)
                
                if mask_identity:
                    # Process video to mask faces and modify voice
                    self._process_video_identity(temp_video, processed_video)
                    upload_path = processed_video
                else:
                    upload_path = temp_video
                
                # Upload to Cloudinary
                result = cloudinary.uploader.upload(
                    upload_path,
                    resource_type="video",
                    folder="rfq_videos",
                    eager=[
                        {"streaming_profile": "full_hd", "format": "m3u8"}
                    ],
                    eager_async=True
                )
                
                return {
                    "success": True,
                    "video_url": result["secure_url"],
                    "public_id": result["public_id"],
                    "format": result["format"],
                    "duration": result["duration"]
                }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _process_video_identity(
        self,
        input_path: str,
        output_path: str
    ) -> None:
        """Process video to mask faces and modify voice"""
        video = VideoFileClip(input_path)
        
        # Process each frame to blur faces
        def blur_faces(frame):
            faces = self.detector.detect(frame)
            for face in faces:
                x1, y1, x2, y2 = face
                face_region = frame[int(y1):int(y2), int(x1):int(x2)]
                blurred_face = self._gaussian_blur(face_region, 25)
                frame[int(y1):int(y2), int(x1):int(x2)] = blurred_face
            return frame
        
        processed_video = video.fl_image(blur_faces)
        
        # Extract and modify audio
        audio = video.audio
        if audio is not None:
            # Save audio to temp file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                audio.write_audiofile(temp_audio.name)
                
                # Modify voice pitch
                modified_audio = self._modify_voice(temp_audio.name)
                
                # Create new audio clip
                new_audio = AudioFileClip(modified_audio)
                
                # Combine with processed video
                final_video = processed_video.set_audio(new_audio)
                
                # Cleanup temp audio files
                os.unlink(temp_audio.name)
                os.unlink(modified_audio)
        else:
            final_video = processed_video
        
        # Write final video
        final_video.write_videofile(
            output_path,
            codec="libx264",
            audio_codec="aac"
        )
        
        # Close video files
        video.close()
        if audio is not None:
            audio.close()
            new_audio.close()
        final_video.close()

    def _gaussian_blur(self, image: np.ndarray, kernel_size: int) -> np.ndarray:
        """Apply Gaussian blur to image region"""
        import cv2
        return cv2.GaussianBlur(image, (kernel_size, kernel_size), 0)

    def _modify_voice(self, audio_path: str) -> str:
        """Modify voice pitch to protect identity"""
        # Load audio
        audio = AudioSegment.from_wav(audio_path)
        
        # Modify pitch (lower by 2 semitones)
        modified_audio = audio._spawn(audio.raw_data, overrides={
            "frame_rate": int(audio.frame_rate * 0.89)  # Lower pitch
        })
        modified_audio = modified_audio.set_frame_rate(audio.frame_rate)
        
        # Export modified audio
        output_path = audio_path.replace(".wav", "_modified.wav")
        modified_audio.export(output_path, format="wav")
        
        return output_path

    async def process_product_video(
        self,
        video_file: str,
        supplier_id: int
    ) -> Dict[str, Any]:
        """Process supplier product showcase video"""
        try:
            # Upload to Cloudinary with optimization
            result = cloudinary.uploader.upload(
                video_file,
                resource_type="video",
                folder=f"supplier_{supplier_id}",
                eager=[
                    {
                        "streaming_profile": "full_hd",
                        "format": "m3u8"
                    },
                    {
                        "width": 320,
                        "height": 240,
                        "crop": "pad",
                        "format": "mp4"
                    }
                ],
                eager_async=True
            )
            
            return {
                "success": True,
                "video_url": result["secure_url"],
                "public_id": result["public_id"],
                "format": result["format"],
                "duration": result["duration"],
                "thumbnail_url": result["eager"][1]["secure_url"]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
