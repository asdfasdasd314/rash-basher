from app import app
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

# import tensorflow as tf

# model = tf.keras.models.load_model('models/rash_classifier.h5')
# converter = tf.lite.TFLiteConverter.from_keras_model(model)
# converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS]
# tflite_model = converter.convert()
# with open("converted_model.tflite", "wb") as f:
#     f.write(tflite_model)