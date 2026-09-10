#!/bin/bash

# WebAssembly Derleme Betiği
# Emscripten ortamının kurulu ve yüklü (source emsdk_env.sh) olduğundan emin olun.

echo "AAEBlocker WebAssembly Derlemesi Başlatılıyor..."

# Emscripten kontrolü
if ! command -v emcc &> /dev/null; then
    echo "HATA: emcc bulunamadı! Emscripten'in kurulu ve ortam değişkenlerinin (PATH) ayarlanmış olduğundan emin olun."
    exit 1
fi

# Çıktı dizini kontrolü ve oluşturulması
OUT_DIR="../js/wasm"
mkdir -p "$OUT_DIR"

# Derleme işlemi
echo "aae-matmul.c derleniyor..."

emcc aae-matmul.c -O3 \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS="['_dot_product', '_relu_activation', '_sigmoid_activation', '_forward_pass']" \
    -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16MB \
    -o "$OUT_DIR/aae-matmul.js"

if [ $? -eq 0 ]; then
    echo "BAŞARILI: aae-matmul.wasm ve aae-matmul.js $OUT_DIR dizinine oluşturuldu."
else
    echo "HATA: Derleme başarısız oldu!"
    exit 1
fi
