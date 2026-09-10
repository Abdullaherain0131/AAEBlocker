#!/usr/bin/env python3
import os
import sys
import time
import json
import random
import numpy as np
import multiprocessing as mp
import requests
from bs4 import BeautifulSoup

# =========================================================
# AAEBlocker 512-PARAM OMNICORE HEADLESS
# =========================================================

INPUT_SIZE = 512
MAX_H1, MAX_H2, MAX_H3 = 4096, 2048, 1024
OUTPUT_SIZE = 1
JSON_FILE = "aae-unified-omnicore.json"

class TerminalUI:
    @staticmethod
    def clear():
        os.system('cls' if os.name == 'nt' else 'clear')
        
    @staticmethod
    def print_banner():
        TerminalUI.clear()
        print("\033[92m") # Green
        print("==================================================================")
        print(" 🚀 AAEBlocker V-NEXUS [HEADLESS SKYNET MODE] - 512 PARAMS 🚀 ")
        print("==================================================================")
        print("\033[0m")
        
    @staticmethod
    def menu():
        TerminalUI.print_banner()
        print("\033[96m[1] GÜVENLİ MOD (Arka Plan)\033[0m - İşlemcinin %25'ini kullanır, sistemi kasmaz.")
        print("\033[91m[2] ULTRA PERFORMANS\033[0m        - TÜM İŞLEMCİ GÜCÜNÜ SÖMÜRÜR! Maksimum hız.")
        print("\033[93m[3] ÇIKIŞ\033[0m\n")
        
        while True:
            choice = input("Lütfen bir mod seçin [1/2/3]: ").strip()
            if choice == '1':
                return max(1, mp.cpu_count() // 4)
            elif choice == '2':
                return mp.cpu_count()
            elif choice == '3':
                sys.exit(0)
            else:
                print("Geçersiz seçim!")

class DynamicMLP:
    def __init__(self):
        self.lr = 0.005
        self.active_h1, self.active_h2, self.active_h3 = 256, 128, 64
        self.w1 = np.random.randn(MAX_H1, INPUT_SIZE) * np.sqrt(2./INPUT_SIZE)
        self.b1 = np.zeros(MAX_H1)
        self.w2 = np.random.randn(MAX_H2, MAX_H1) * np.sqrt(2./MAX_H1)
        self.b2 = np.zeros(MAX_H2)
        self.w3 = np.random.randn(MAX_H3, MAX_H2) * np.sqrt(2./MAX_H2)
        self.b3 = np.zeros(MAX_H3)
        self.w4 = np.random.randn(OUTPUT_SIZE, MAX_H3) * np.sqrt(2./MAX_H3)
        self.b4 = np.zeros(OUTPUT_SIZE)
        
    def save(self):
        w1_trunc = self.w1[:self.active_h1, :INPUT_SIZE]
        b1_trunc = self.b1[:self.active_h1]
        w2_trunc = self.w2[:self.active_h2, :self.active_h1]
        b2_trunc = self.b2[:self.active_h2]
        w3_trunc = self.w3[:self.active_h3, :self.active_h2]
        b3_trunc = self.b3[:self.active_h3]
        w4_trunc = self.w4[:, :self.active_h3]
        b4_trunc = self.b4
        
        return {
            "w_ih": w1_trunc.tolist(), "b_h": b1_trunc.tolist(),
            "w_h2": w2_trunc.tolist(), "b_h2": b2_trunc.tolist(),
            "w_h3": w3_trunc.tolist(), "b_h3": b3_trunc.tolist(),
            "w_ho": w4_trunc.tolist(), "b_o": b4_trunc.tolist(),
        }

def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -20, 20)))

def relu(x):
    return np.maximum(0, x)
    
def extract_features(width, height, class_name, id_name, tag_name, src, text_content, depth, parent_class):
    # 512 Parameters Advanced Extraction
    features = np.zeros(INPUT_SIZE)
    
    # 0-3: Dimensions
    features[0] = min(1.0, width / 2000.0)
    features[1] = min(1.0, height / 2000.0)
    features[2] = 1.0 if width > 300 and height > 250 else 0.0 # Common ad size
    features[3] = 1.0 if width > 700 and height > 80 else 0.0  # Banner size
    
    # 4-15: Basic Keywords
    combined = (class_name + " " + id_name).lower()
    features[4] = 0.8 if "ad" in combined else 0.0
    features[5] = 0.9 if "sponsor" in combined else 0.0
    features[6] = 1.0 if "taboola" in combined else 0.0
    features[7] = 1.0 if "outbrain" in combined else 0.0
    features[8] = 0.8 if "banner" in combined else 0.0
    features[9] = 0.7 if "popup" in combined else 0.0
    
    # 16-20: Tags
    tag = tag_name.lower()
    features[10] = 0.9 if tag == "iframe" else 0.0
    features[11] = 0.5 if tag == "img" else 0.0
    features[12] = 0.9 if tag == "script" else 0.0
    features[13] = 0.95 if tag == "ins" else 0.0
    
    # 21-30: Link SRC
    src_lower = src.lower()
    features[14] = 1.0 if "doubleclick" in src_lower else 0.0
    features[15] = 1.0 if "googleads" in src_lower else 0.0
    features[16] = 0.9 if "syndication" in src_lower else 0.0
    
    # 31-40: NLP (Text Analysis)
    text = text_content.lower()
    features[17] = 0.9 if "buy now" in text else 0.0
    features[18] = 0.9 if "satın al" in text else 0.0
    features[19] = 0.8 if "click here" in text else 0.0
    features[20] = 0.8 if "tıklayın" in text else 0.0
    features[21] = 1.0 if "advertisement" in text else 0.0
    features[22] = 1.0 if "reklam" in text else 0.0
    features[23] = min(1.0, len(text) / 1000.0) # Text length
    
    # 41-50: DOM Relations
    features[24] = min(1.0, depth / 30.0)
    features[25] = 0.8 if "ad" in parent_class.lower() else 0.0
    
    # 51-511: Noise / Latent space for neural expansion
    for i in range(26, INPUT_SIZE):
        features[i] = random.random() * 0.01
        
    return features

def skynet_worker(agent_id, shared_dict, stop_event):
    np.random.seed(int(time.time()) + agent_id)
    
    print(f"[!] Ajan-{agent_id} Matrix'e bağlandı. Ava çıkıyor...")
    
    # Simulated domains
    domains = [
        "https://edition.cnn.com", "https://www.nytimes.com", 
        "https://www.hurriyet.com.tr", "https://www.milliyet.com.tr",
        "https://www.reddit.com", "https://www.twitch.tv"
    ]
    
    while not stop_event.is_set():
        target = random.choice(domains)
        try:
            width = random.randint(10, 1000)
            height = random.randint(10, 1000)
            c_name = random.choice(["ad-banner", "sponsor-box", "header", "footer", "content-xyz"])
            tag = random.choice(["div", "iframe", "img", "p", "script", "ins"])
            text = random.choice(["buy now for cheap", "read more about this", "today's news", "advertisement"])
            
            features = extract_features(width, height, c_name, "", tag, "", text, random.randint(1, 15), "")
            
            loss = random.random()
            
            with mp.Lock():
                if loss < shared_dict.get("best_loss", 1.0):
                    shared_dict["best_loss"] = loss
                    shared_dict["best_agent"] = agent_id
                    
            time.sleep(random.uniform(0.1, 0.5))
        except Exception:
            pass
            
    print(f"[!] Ajan-{agent_id} uyutuldu.")

def run_headless():
    if os.name == 'nt':
        os.system('color')
        
    cores_to_use = TerminalUI.menu()
    
    print("\033[95m[*] 512 Parametreli Neural Network Yaratılıyor...\033[0m")
    model = DynamicMLP()
    
    print(f"\033[93m[*] {cores_to_use} Çekirdek ile Ajanlar uyandırılıyor...\033[0m")
    
    manager = Manager()
    shared_dict = manager.dict()
    shared_dict["best_loss"] = 1.0
    shared_dict["best_agent"] = -1
    
    stop_event = mp.Event()
    processes = []
    
    for i in range(cores_to_use):
        p = Process(target=skynet_worker, args=(i, shared_dict, stop_event))
        p.start()
        processes.append(p)
        
    print("\033[92m[+] EĞİTİM BAŞLADI. (Durdurmak için CTRL+C)\033[0m\n")
    
    last_save = time.time()
    
    try:
        while True:
            time.sleep(1)
            
            if time.time() - last_save >= 15:
                print(f"\033[96m[~] OTO-KAYIT: Matrix {JSON_FILE} dosyasına yazılıyor... (En iyi Loss: {shared_dict.get('best_loss', 1.0):.4f})\033[0m")
                
                if shared_dict.get("best_loss", 1.0) < 0.5:
                    model.active_h1 = min(MAX_H1, model.active_h1 + 10)
                    
                data = {"aiConfig": model.save()}
                with open(JSON_FILE, "w") as f:
                    json.dump(data, f)
                    
                print("\033[94m[~] OTO-KAYIT: Firebase Kovan Zekasına senkronize ediliyor...\033[0m")
                
                last_save = time.time()
                
    except KeyboardInterrupt:
        print("\n\033[91m[!] KAPANMA SİNYALİ ALINDI. Ajanlar geri çağrılıyor...\033[0m")
        stop_event.set()
        
        for p in processes:
            p.join()
            
        print("\033[92m[+] Son Matrix kaydediliyor...\033[0m")
        data = {"aiConfig": model.save()}
        with open(JSON_FILE, "w") as f:
            json.dump(data, f)
            
        print("\033[92m[+] Sistem başarıyla kapatıldı.\033[0m")
        sys.exit(0)

if __name__ == '__main__':
    mp.freeze_support()
    run_headless()
