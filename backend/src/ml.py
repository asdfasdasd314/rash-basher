import tflite_runtime.interpreter as tflite
import numpy as np
import os
import io
from PIL import Image

MODEL_PATH = "./models/rash_classifier.tflite"

print(f"Attempting to load model from: {MODEL_PATH}")  # Debug print

try:
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
    print("Model loaded successfully!")  # Debug print
except Exception as e:
    print(f"Error loading model: {str(e)}")  # More detailed error message
    raise RuntimeError(f"Failed to load model at {MODEL_PATH}: {e}")

print("File exists:", os.path.exists(MODEL_PATH))
print("File size:", os.path.getsize(MODEL_PATH))
print(input_details)
print(output_details)

def classify_image(image_bytes: bytes) -> dict:
    """
    Classify an image using the loaded CNN model.
    
    Args:
        image_bytes (bytes): The image data in bytes format
        
    Returns:
        dict: Dictionary containing predicted class and confidence score.
              Returns "nonr" as class if confidence is less than 50%
    """
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Resize image to match model's expected input size
        img = img.resize((28, 28))
        
        # Convert PIL Image to numpy array
        img_array = np.array(img)
        
        # Add batch dimension and normalize pixel values
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.astype('float32') / 255.0
        
        # Make prediction
        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        predictions = interpreter.get_tensor(output_details[0]['index'])
        
        # Get the class with highest probability
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        
        # Map the predicted class index to actual class label
        class_labels = ['actinic keratoses and intraepithelial carcinomae', 'basal cell carcinoma',  'benign keratosis-like lesions', 'dermatofibroma', 'melanoma', 'melanocytic nevi', 'pyogenic granulomas and hemorrhage', 'melanoma']  # Replace with your actual class labels
        
        # Return "nonr" if confidence is less than 50%
        if confidence < 0.5:
            return {
                'class': 'none',
                'confidence': confidence
            }
        
        predicted_label = class_labels[predicted_class]
        
        return {
            'class': predicted_label,
            'confidence': confidence
        }
        
    except Exception as e:
        raise RuntimeError(f"Error during image classification: {str(e)}")
