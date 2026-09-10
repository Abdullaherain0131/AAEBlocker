#include <emscripten.h>
#include <math.h>

// 1. Dot product: input[inputSize] * weights[outputSize][inputSize] + bias[outputSize] = result[outputSize]
EMSCRIPTEN_KEEPALIVE
void dot_product(float* input, float* weights, float* bias, float* result, int inputSize, int outputSize) {
    for (int i = 0; i < outputSize; ++i) {
        float sum = bias[i];
        int w_offset = i * inputSize;
        
        // Loop unrolling for better performance
        int j = 0;
        for (; j <= inputSize - 4; j += 4) {
            sum += input[j] * weights[w_offset + j] +
                   input[j+1] * weights[w_offset + j + 1] +
                   input[j+2] * weights[w_offset + j + 2] +
                   input[j+3] * weights[w_offset + j + 3];
        }
        // Handle remaining elements
        for (; j < inputSize; ++j) {
            sum += input[j] * weights[w_offset + j];
        }
        
        result[i] = sum;
    }
}

// 2. ReLU activation in-place
EMSCRIPTEN_KEEPALIVE
void relu_activation(float* data, int size) {
    for (int i = 0; i < size; ++i) {
        if (data[i] < 0.0f) {
            data[i] = 0.0f;
        }
    }
}

// 3. Sigmoid activation (single value)
EMSCRIPTEN_KEEPALIVE
float sigmoid_activation(float x) {
    return 1.0f / (1.0f + expf(-x));
}

// 4. Full forward pass: 4-layer network
// Layer sizes: INPUT_SIZE -> hidden1 -> hidden2 -> hidden3 -> 1 output
EMSCRIPTEN_KEEPALIVE
float forward_pass(float* input, int inputSize,
                   float* w1, float* b1, int h1Size,
                   float* w2, float* b2, int h2Size, 
                   float* w3, float* b3, int h3Size,
                   float* w4, float* b4) {
    
    // Yığın üzerinde ara bellekler
    float h1_out[1024]; // Varsayılan maksimum boyutlar
    float h2_out[512];
    float h3_out[256];
    
    // Katman 1
    dot_product(input, w1, b1, h1_out, inputSize, h1Size);
    relu_activation(h1_out, h1Size);
    
    // Katman 2
    dot_product(h1_out, w2, b2, h2_out, h1Size, h2Size);
    relu_activation(h2_out, h2Size);
    
    // Katman 3
    dot_product(h2_out, w3, b3, h3_out, h2Size, h3Size);
    relu_activation(h3_out, h3Size);
    
    // Çıktı Katmanı (Tek nöron varsayımı)
    float final_out;
    dot_product(h3_out, w4, b4, &final_out, h3Size, 1);
    
    return sigmoid_activation(final_out);
}
