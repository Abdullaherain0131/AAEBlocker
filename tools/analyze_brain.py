import json
import sys
import math

def analyze_brain(filepath):
    print("==========================================")
    print("🧠 AAEBlocker Brain Matrix Analyzer 🧠")
    print("==========================================")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if "aiConfig" not in data:
            print("❌ Hata: JSON içinde aiConfig bulunamadı.")
            sys.exit(1)
            
        brain = data["aiConfig"]
        
        # Calculate matrix dimensions
        w_ih_shape = (len(brain.get("w_ih", [])), len(brain.get("w_ih", [[]])[0]))
        w_h2_shape = (len(brain.get("w_h2", [])), len(brain.get("w_h2", [[]])[0]))
        w_h3_shape = (len(brain.get("w_h3", [])), len(brain.get("w_h3", [[]])[0]))
        w_ho_shape = (len(brain.get("w_ho", [])), len(brain.get("w_ho", [[]])[0]))
        
        # Calculate total parameters
        total_weights = (w_ih_shape[0] * w_ih_shape[1]) + \
                        (w_h2_shape[0] * w_h2_shape[1]) + \
                        (w_h3_shape[0] * w_h3_shape[1]) + \
                        (w_ho_shape[0] * w_ho_shape[1])
                        
        total_biases = len(brain.get("b_h", [])) + \
                       len(brain.get("b_h2", [])) + \
                       len(brain.get("b_h3", [])) + \
                       len(brain.get("b_o", []))
                       
        total_params = total_weights + total_biases
        
        # Check if there is metadata
        print(f"[*] Dosya Yolu: {filepath}")
        print(f"[*] Giriş Parametresi (Input Features): {w_ih_shape[1]}")
        print(f"[*] Çıkış Parametresi (Output Nodes): {w_ho_shape[0]}")
        print("\n[+] AĞ MİMARİSİ (NEURAL NETWORK TOPOLOGY)")
        print(f"  -> Katman 1 (Input -> H1): {w_ih_shape[1]} x {w_ih_shape[0]} Nöron")
        print(f"  -> Katman 2 (H1 -> H2): {w_h2_shape[1]} x {w_h2_shape[0]} Nöron")
        print(f"  -> Katman 3 (H2 -> H3): {w_h3_shape[1]} x {w_h3_shape[0]} Nöron")
        print(f"  -> Katman 4 (H3 -> Output): {w_ho_shape[1]} x {w_ho_shape[0]} Nöron")
        print(f"\n[+] TOPLAM AĞIRLIK (Synaptic Weights): {total_weights:,}")
        print(f"[+] TOPLAM BIAS (Dengeleyiciler): {total_biases:,}")
        print(f"[+] TOPLAM YAPAY ZEKA PARAMETRESİ: {total_params:,}")
        
        # Analyze weight distribution (sparsity/health)
        # Just taking a sample of w_ih to not freeze memory
        w_ih = brain.get("w_ih", [])
        zeros = 0
        total_sampled = 0
        sum_w = 0
        for i in range(min(50, len(w_ih))):
            for j in range(len(w_ih[i])):
                val = w_ih[i][j]
                sum_w += abs(val)
                if abs(val) < 0.001:
                    zeros += 1
                total_sampled += 1
                
        sparsity = (zeros / total_sampled) * 100 if total_sampled > 0 else 0
        avg_w = sum_w / total_sampled if total_sampled > 0 else 0
        
        print("\n[+] SAĞLIK ANALİZİ")
        print(f"  -> Ortalama Ağırlık Gücü: {avg_w:.4f}")
        print(f"  -> Seyreklik (Sparsity - Pruning Etkisi): %{sparsity:.2f}")
        
        if sparsity > 50:
            print("  -> Yorum: Ağ ciddi şekilde 'Pruning' edilmiş. Çok verimli çalışacak.")
        else:
            print("  -> Yorum: Ağ çok yoğun, tüm nöronlar aktif savaşıyor.")
            
        print("\n==========================================")
        
    except Exception as e:
        print(f"❌ Hata: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanım: python3 analyze_brain.py <json_yolu>")
    else:
        analyze_brain(sys.argv[1])
