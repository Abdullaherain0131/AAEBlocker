#include <emscripten.h>
#include <math.h>

extern "C" {

// Hızlı Sigmoid Aktivasyon Fonksiyonu
EMSCRIPTEN_KEEPALIVE
float sigmoid_activation(float x) {
    return 1.0f / (1.0f + expf(-x));
}

// Hızlı ReLU Aktivasyon Fonksiyonu
EMSCRIPTEN_KEEPALIVE
void relu_activation(float* data, int length) {
    for (int i = 0; i < length; i++) {
        if (data[i] < 0) {
            data[i] = 0;
        }
    }
}

// Yüksek Performanslı Matris Çarpımı (Dot Product)
EMSCRIPTEN_KEEPALIVE
void dot_product(float* input, float* weights, float* bias, float* output, int inputSize, int outputSize) {
    for (int o = 0; o < outputSize; o++) {
        float sum = bias[o];
        int wOffset = o * inputSize;
        
        int i = 0;
        for (; i <= inputSize - 4; i += 4) {
            sum += input[i] * weights[wOffset + i]
                 + input[i+1] * weights[wOffset + i+1]
                 + input[i+2] * weights[wOffset + i+2]
                 + input[i+3] * weights[wOffset + i+3];
        }
        for (; i < inputSize; i++) {
            sum += input[i] * weights[wOffset + i];
        }
        output[o] = sum;
    }
}

// Tek seferde tam ileri besleme (Forward Pass) - 4 Katman
EMSCRIPTEN_KEEPALIVE
float forward_pass(float* input, int inputSize,
                   float* w1, float* b1, int h1Size,
                   float* w2, float* b2, int h2Size,
                   float* w3, float* b3, int h3Size,
                   float* w4, float* b4) {
                       
    // 1. Gizli Katman
    float hidden1[512]; // Maksimum 512 nöron varsayımı
    dot_product(input, w1, b1, hidden1, inputSize, h1Size);
    relu_activation(hidden1, h1Size);

    // 2. Gizli Katman
    float hidden2[256];
    dot_product(hidden1, w2, b2, hidden2, h1Size, h2Size);
    relu_activation(hidden2, h2Size);

    // 3. Gizli Katman
    float hidden3[128];
    dot_product(hidden2, w3, b3, hidden3, h2Size, h3Size);
    relu_activation(hidden3, h3Size);

    // 4. Çıktı Katmanı (Tek Nöron - 0/1 olasılığı)
    float finalOutput = b4[0];
    for (int i = 0; i < h3Size; i++) {
        finalOutput += hidden3[i] * w4[i];
    }
    
    return sigmoid_activation(finalOutput);
}

}
