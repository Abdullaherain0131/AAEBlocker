#!/bin/bash

# AAEBlocker WASM Derleme Betiği
# Bu betik aae-engine.cpp dosyasını alıp aae-engine.wasm ve .js köprü dosyasına dönüştürür.

echo "========================================="
echo " AAEBlocker Kuantum Motoru Derleyicisi"
echo "========================================="

# Emscripten'in yüklü olup olmadığını kontrol et
if ! command -v emcc &> /dev/null
then
    echo "HATA: emcc bulunamadı!"
    echo "Lütfen Emscripten (emsdk) yükleyin:"
    echo "  git clone https://github.com/emscripten-core/emsdk.git"
    echo "  cd emsdk"
    echo "  ./emsdk install latest"
    echo "  ./emsdk activate latest"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

echo "[1/3] aae-engine.cpp derleniyor..."

# Çıktı klasörünü kontrol et
mkdir -p ../js/wasm

# Derleme komutu
emcc aae-engine.cpp \
    -O3 -flto -msimd128 -ffast-math \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS="['_dot_product', '_relu_activation', '_sigmoid_activation', '_forward_pass']" \
    -s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16MB \
    -o ../js/wasm/aae-engine.js

if [ $? -eq 0 ]; then
    echo "[2/3] Derleme başarılı! (aae-engine.wasm ve aae-engine.js oluşturuldu)"
    
    # Dosya boyutlarını göster
    echo "[3/3] Dosya boyutları:"
    ls -lh ../js/wasm/aae-engine.*
    
    echo "========================================="
    echo " Kuantum Motoru entegrasyona hazır!"
    echo "========================================="
else
    echo "HATA: Derleme başarısız oldu."
    exit 1
fi
