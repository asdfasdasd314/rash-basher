from keras.models import load_model
from keras.preprocessing import image
import numpy as np 
import tensorflow as tf
import os
import io
from PIL import Image

MODEL_PATH = os.path.join("models", "rash_classifier.h5")

try:
    model = load_model(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Failed to load model at {MODEL_PATH}: {e}")

print(model.input_shape)

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
        # bytes to Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Resize 
        img = img.resize((224, 224))
        
        #Image to numpy array
        img_array = np.array(img)
        
        # Add batch dimensions/normalize pixel values
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array.astype('float32') / 255.0
        
        # prediction
        predictions = model.predict(img_array)
        
        #  highest prob
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        
        # Map class index to label
        class_labels = ['class1', 'class2', 'class3']  # Replace with your actual class labels
        
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

with open('path_to_image.jpg', 'rb') as f:
    image_bytes = f.read()
prediction = classify_image(image_bytes)
print(f"Predicted class: {prediction}")



