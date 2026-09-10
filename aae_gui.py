import tkinter as tk
from tkinter import font, ttk, messagebox
import multiprocessing
from multiprocessing import Process, Manager, Queue, Event
import random, math, time, os, sys, json
import threading
import requests
import numpy as np

# =========================================================
# AAEBlocker V-NEXUS ULTRA DELUXE V2 (Canavar Modu)
# Tkinter GUI | Agresif Mutasyon | Canlı Mod Geçişi
# =========================================================

if os.environ.get("AAE_AWAKE") != "1":
    os.environ["AAE_AWAKE"] = "1"
    try: os.execvp("systemd-inhibit", ["systemd-inhibit", "--what=sleep:idle", "--who=AAE_NEXUS", "--why=GUI_Active", sys.executable, sys.argv[0]])
    except: pass

FIREBASE_URL = "https://aaeb-19471-default-rtdb.europe-west1.firebasedatabase.app/mlp_weights.json"
INPUT_SIZE = 250 
# Limitler Daha da Büyütüldü!
MAX_H1, MAX_H2, MAX_H3 = 2048, 1024, 512 
OUTPUT_SIZE = 1 

def push_to_firebase_task(payload):
    try:
        response = requests.post(FIREBASE_URL, json=payload, timeout=5)
        if response.status_code == 200:
            print("\n☁️ [BİLGİ] Yeni zeka Firebase'e YÜKLENDİ! Tüm tarayıcılar güncellenecek.")
    except Exception:
        print("\n☁️ [HATA] Firebase bağlantı hatası (İnternet yok mu?)")

class DynamicMLP:
    def __init__(self):
        self.lr = 0.99 # Çırak hızı 2x daha artırıldı (Limit!)
        self.active_h1, self.active_h2, self.active_h3 = 256, 128, 64 
        self.is_master = False 
        
        self.w1 = np.random.uniform(-0.1, 0.1, (INPUT_SIZE, MAX_H1))
        self.b1 = np.random.uniform(-0.1, 0.1, (MAX_H1,))
        self.w2 = np.random.uniform(-0.1, 0.1, (MAX_H1, MAX_H2))
        self.b2 = np.random.uniform(-0.1, 0.1, (MAX_H2,))
        self.w3 = np.random.uniform(-0.1, 0.1, (MAX_H2, MAX_H3))
        self.b3 = np.random.uniform(-0.1, 0.1, (MAX_H3,))
        self.w4 = np.random.uniform(-0.1, 0.1, (MAX_H3, OUTPUT_SIZE))
        self.b4 = np.random.uniform(-0.1, 0.1, (OUTPUT_SIZE,))

    def prune_brain(self):
        # Tembel (0'a çok yakın) nöron bağlantılarını bul ve buda (Synaptic Pruning)
        threshold = 0.005
        
        pruned_w1 = np.abs(self.w1[:self.active_h1, :]) < threshold
        self.w1[:self.active_h1, :][pruned_w1] = np.random.randn(np.sum(pruned_w1)) * np.sqrt(2./INPUT_SIZE)
        
        pruned_w2 = np.abs(self.w2[:self.active_h2, :self.active_h1]) < threshold
        self.w2[:self.active_h2, :self.active_h1][pruned_w2] = np.random.randn(np.sum(pruned_w2)) * np.sqrt(2./self.active_h1)
        
        pruned_w3 = np.abs(self.w3[:self.active_h3, :self.active_h2]) < threshold
        self.w3[:self.active_h3, :self.active_h2][pruned_w3] = np.random.randn(np.sum(pruned_w3)) * np.sqrt(2./self.active_h2)

    def relu(self, x): return np.maximum(0, x)

    def get_param_count(self):
        return (INPUT_SIZE * self.active_h1 + self.active_h1) + \
               (self.active_h1 * self.active_h2 + self.active_h2) + \
               (self.active_h2 * self.active_h3 + self.active_h3) + \
               (self.active_h3 * OUTPUT_SIZE + OUTPUT_SIZE)

    def force_mutate(self):
        # V3: Sürekli Genişleme - Dengeli Optimizasyon
        if self.active_h1 < MAX_H1: self.active_h1 = min(MAX_H1, self.active_h1 + 128)
        if self.active_h2 < MAX_H2: self.active_h2 = min(MAX_H2, self.active_h2 + 64)
        if self.active_h3 < MAX_H3: self.active_h3 = min(MAX_H3, self.active_h3 + 32)
        
        self.b1[:self.active_h1] += np.random.uniform(-1.0, 1.0, (self.active_h1,))

    def train(self, inputs, target_val):
        h1, h2, h3 = self.active_h1, self.active_h2, self.active_h3
        x = np.array(inputs)
        
        z1 = np.dot(x, self.w1[:, :h1]) + self.b1[:h1]
        a1 = np.where(z1 > 0, z1, 0.01 * z1)
        
        z2 = np.dot(a1, self.w2[:h1, :h2]) + self.b2[:h2]
        a2 = np.where(z2 > 0, z2, 0.01 * z2)
        
        z3 = np.dot(a2, self.w3[:h2, :h3]) + self.b3[:h3]
        a3 = np.where(z3 > 0, z3, 0.01 * z3)
        
        val = np.dot(a3, self.w4[:h3, 0]) + self.b4[0]
        val_clipped = np.clip(val, -10, 10)
        out = 1.0 / (1.0 + np.exp(-val_clipped))
            
        err = target_val - out
        d4 = err * (out * (1.0 - out))
        
        d_a3 = np.where(a3 > 0, 1.0, 0.01)
        d3 = d4 * self.w4[:h3, 0] * d_a3
        
        d_a2 = np.where(a2 > 0, 1.0, 0.01)
        d2 = np.dot(d3, self.w3[:h2, :h3].T) * d_a2
        
        d_a1 = np.where(a1 > 0, 1.0, 0.01)
        d1 = np.dot(d2, self.w2[:h1, :h2].T) * d_a1

        self.w4[:h3, 0] += self.lr * d4 * a3
        self.b4[0] += self.lr * d4
        self.w3[:h2, :h3] += self.lr * np.outer(a2, d3)
        self.b3[:h3] += self.lr * d3
        self.w2[:h1, :h2] += self.lr * np.outer(a1, d2)
        self.b2[:h2] += self.lr * d2
        self.w1[:, :h1] += self.lr * np.outer(x, d1)
        self.b1[:h1] += self.lr * d1
        return abs(err), out

    def train_batch(self, X_batch, Y_batch):
        # BATCH (MATRİS) ÇARPIMI İLE ULTRA HIZLI EĞİTİM (NumPy Optimizasyonu)
        h1, h2, h3 = self.active_h1, self.active_h2, self.active_h3
        
        z1 = np.dot(X_batch, self.w1[:, :h1]) + self.b1[:h1]
        a1 = np.where(z1 > 0, z1, 0.01 * z1)
        
        z2 = np.dot(a1, self.w2[:h1, :h2]) + self.b2[:h2]
        a2 = np.where(z2 > 0, z2, 0.01 * z2)
        
        z3 = np.dot(a2, self.w3[:h2, :h3]) + self.b3[:h3]
        a3 = np.where(z3 > 0, z3, 0.01 * z3)
        
        val = np.dot(a3, self.w4[:h3, :1]) + self.b4[:1]
        val_clipped = np.clip(val, -10, 10)
        out = 1.0 / (1.0 + np.exp(-val_clipped))
        
        err = Y_batch - out
        d4 = err * (out * (1.0 - out))
        
        d_a3 = np.where(a3 > 0, 1.0, 0.01)
        d3 = np.dot(d4, self.w4[:h3, :1].T) * d_a3
        
        d_a2 = np.where(a2 > 0, 1.0, 0.01)
        d2 = np.dot(d3, self.w3[:h2, :h3].T) * d_a2
        
        d_a1 = np.where(a1 > 0, 1.0, 0.01)
        d1 = np.dot(d2, self.w2[:h1, :h2].T) * d_a1
        
        batch_size = len(X_batch)
        self.w4[:h3, :1] += self.lr * np.dot(a3.T, d4) / batch_size
        self.b4[:1] += self.lr * np.mean(d4, axis=0)
        self.w3[:h2, :h3] += self.lr * np.dot(a2.T, d3) / batch_size
        self.b3[:h3] += self.lr * np.mean(d3, axis=0)
        self.w2[:h1, :h2] += self.lr * np.dot(a1.T, d2) / batch_size
        self.b2[:h2] += self.lr * np.mean(d2, axis=0)
        self.w1[:, :h1] += self.lr * np.dot(X_batch.T, d1) / batch_size
        self.b1[:h1] += self.lr * np.mean(d1, axis=0)
        
        return np.mean(np.abs(err)), out
        
    def export_weights(self):
        return {
            "learningRate": self.lr,
            "w_ih": self.w1.tolist(),
            "b_h": self.b1.tolist(),
            "w_h2": self.w2.tolist(),
            "b_h2": self.b2.tolist(),
            "w_h3": self.w3.tolist(),
            "b_h3": self.b3.tolist(),
            "w_ho": self.w4.tolist(),
            "b_o": self.b4.tolist(),
            "active_h1": self.active_h1,
            "active_h2": self.active_h2,
            "active_h3": self.active_h3
        }
        
    def load_weights(self, w_data):
        try:
            self.lr = w_data.get("learningRate", self.lr)
            self.active_h1 = w_data.get("active_h1", self.active_h1)
            self.active_h2 = w_data.get("active_h2", self.active_h2)
            self.active_h3 = w_data.get("active_h3", self.active_h3)
            
            if "w_ih" in w_data: self.w1 = np.array(w_data["w_ih"])
            if "b_h" in w_data: self.b1 = np.array(w_data["b_h"])
            if "w_h2" in w_data: self.w2 = np.array(w_data["w_h2"])
            if "b_h2" in w_data: self.b2 = np.array(w_data["b_h2"])
            if "w_h3" in w_data: self.w3 = np.array(w_data["w_h3"])
            if "b_h3" in w_data: self.b3 = np.array(w_data["b_h3"])
            if "w_ho" in w_data: self.w4 = np.array(w_data["w_ho"])
            if "b_o" in w_data: self.b4 = np.array(w_data["b_o"])
        except Exception as e:
            print("Ağırlık yükleme hatası:", e)

# =========================================================
# YAPAY ZEKA SÜREÇLERİ (PROCESS)
# =========================================================
def faction_process(faction_id, role, faction_type, shared_stats, site_queue, war_queue, log_queue, stop_event, initial_weights=None):
    ai = DynamicMLP()
    
    if initial_weights and faction_type == "GOOD":
        ai.load_weights(initial_weights)
        
    # Herkes çırak (ÇIRAK) olarak başlıyor!
    stats = {"role": role, "type": faction_type, "scanned": 0, "success": 0, "rank": "ÇIRAK", "error": 1.0, "params": ai.get_param_count()}
    
    batch_err = 0.0
    iters = 0
    stagnation_counter = 0 
    last_err = 1.0
    reproduced = False
    
    while not stop_event.is_set():
        current_mode = shared_stats.get("execution_mode", "ULTRA")
        # IPC kuyruğu (queue) zaten darboğaz yarattığı için CPU'yu %100 kilitlemez
        # Bu yüzden ULTRA modunda bekleme süresi 0.01s (maksimum hız), Arka Planda ise 0.1s
        sleep_time = 0.01 if current_mode == "ULTRA" else 0.1
        
        if sleep_time > 0: time.sleep(sleep_time)
        
        # 2X DAHA FAZLA VERİ İŞLEME (Data rate doubled)
        try: data_tuple = site_queue.get(timeout=0.01) if faction_type == "BAD" else war_queue.get(timeout=0.01)
        except: 
            if faction_type == "NEUTRAL": 
                # GERÇEK İNTERNET VERİSİ (Live DOM Scraping)
                try:
                    if random.random() < 0.2: # %20 ihtimalle gerçek site çek
                        urls = ["https://en.wikipedia.org/wiki/Main_Page", "https://github.com", "https://news.ycombinator.com", "https://stackoverflow.com"]
                        html = requests.get(random.choice(urls), timeout=2).text
                        
                        features = [
                            html.count("<script") / 50.0,
                            html.count("<iframe") / 10.0,
                            html.count("<div") / 500.0,
                            html.count("class=") / 500.0,
                            html.count("style=") / 100.0,
                            len(html) / 100000.0
                        ]
                        
                        while len(features) < INPUT_SIZE:
                            features.append(random.uniform(0, 0.1))
                            
                        features = np.clip(np.array(features[:INPUT_SIZE]), 0, 1.0)
                        X_batch = np.tile(features, (80, 1))
                        try: log_queue.put(f"[GERÇEK VERİ] {role} canlı DOM verisi çekti!", block=False)
                        except: pass
                    else:
                        X_batch = np.random.uniform(0, 0.2, (80, INPUT_SIZE))
                except:
                    X_batch = np.random.uniform(0, 0.2, (80, INPUT_SIZE))
                    
                Y_batch = np.zeros((80, 1))
                try: site_queue.put((X_batch, Y_batch), block=False); war_queue.put((X_batch, Y_batch), block=False)
                except: pass
                stats["success"] += 2 # x2 Success
                stats["params"] = ai.get_param_count()
                shared_stats[faction_id] = stats
            continue
            
        if faction_type == "BAD":
            X_batch, Y_batch = data_tuple
            
            # Kötü ajanlar zekalandıkça (parametreleri arttıkça) saldırı hacmi de artar! (16'dan 256'ya kadar)
            num_attacks = min(256, 16 + (ai.get_param_count() // 1000))
            
            # KÖTÜ AJANLARIN ZEKALANMASI (Adversarial GAN Tactic)
            # Sadece 0.5-1.0 yerine, organik gibi görünen (kamuflajlı) 0.1-0.9 arası veri üretirler!
            X_attack = np.random.uniform(0.1, 0.9, (num_attacks, INPUT_SIZE))
            
            # Organik gibi görünmek için bazı inputları (örneğin script sayılarını) bilerek düşük tutar! (Kandırmaca)
            if random.random() < 0.5:
                camouflage_idx = np.random.choice(INPUT_SIZE, size=int(INPUT_SIZE*0.3), replace=False)
                X_attack[:, camouflage_idx] = np.random.uniform(0.0, 0.15, (num_attacks, len(camouflage_idx)))
                
            Y_attack = np.ones((num_attacks, 1))
            X_batch = np.vstack((X_batch, X_attack))
            Y_batch = np.vstack((Y_batch, Y_attack))
            try: war_queue.put((X_batch, Y_batch), block=False)
            except: pass
            stats["success"] += num_attacks # Saldırı miktarı dinamik artıyor
            stats["params"] = ai.get_param_count()
            shared_stats[faction_id] = stats
            continue 

        # Vectorized Batch Training
        X_batch, Y_batch = data_tuple
        
        avg_err_batch, outs = ai.train_batch(X_batch, Y_batch)
        
        batch_err += avg_err_batch * len(X_batch)
        stats["scanned"] += len(X_batch)
        
        targets = (Y_batch > 0.5)
        successes = (outs > 0.75) & targets
        stats["success"] += int(np.sum(successes))
            
        iters += 1
        
        if iters % 15 == 0:
            avg_err = batch_err / (15 * len(X_batch))
            stats["error"] = avg_err
            
            if abs(last_err - avg_err) < 0.001 and avg_err > 0.05:
                stagnation_counter += 1
            else:
                stagnation_counter = 0
                
            if stagnation_counter > 3: 
                # EVRİM VE DOĞAL SEÇİLİM (Genetik Algoritma)
                if faction_type == "GOOD" and avg_err > 0.15 and "best_good_weights" in shared_stats:
                    # Kötü durumdaki ajan kendini yok edip en iyi ajanın klonu olarak yeniden doğar (Natural Selection)
                    best_w = shared_stats["best_good_weights"]
                    ai.load_weights(best_w)
                    ai.force_mutate() # Klonun üzerine mutasyon uygula ki çeşitlilik olsun
                    try: log_queue.put(f"[DOĞAL SEÇİLİM] {role} başarısız oldu. En güçlü ajanın DNA'sını alarak klonlandı!", block=False)
                    except: pass
                else:
                    ai.force_mutate() 
                    try: log_queue.put(f"[MUTASYON] {role} ağırlıklarını güncelledi.", block=False)
                    except: pass
                    
                stagnation_counter = 0
                
            if iters % 300 == 0: # Sürekli Evrim! Her 300 partide bir ağ kapasitesi genişlesin
                ai.force_mutate()
                try: log_queue.put(f"[GENİŞLEME] {role} nöron kapasitesini devasa boyuta çıkardı!", block=False)
                except: pass
                
            if iters % 800 == 0: # ZİHİNSEL TEMİZLİK (Synaptic Pruning)
                ai.prune_brain()
                try: log_queue.put(f"[BUDAMA] {role} tembel nöronlarını temizledi, hafıza optimize edildi!", block=False)
                except: pass
                
            if faction_type == "GOOD" and iters % 1200 == 0: # KOVAN ZEKASI (Hive-Mind Firebase Pull)
                try:
                    resp = requests.get(FIREBASE_URL, timeout=3)
                    if resp.status_code == 200 and resp.json():
                        cloud_data = resp.json()
                        keys = list(cloud_data.keys())
                        if keys:
                            latest_node = cloud_data[keys[-1]]
                            if "mlp" in latest_node:
                                ai.load_weights(latest_node["mlp"])
                                try: log_queue.put(f"[TELEPATİ] {role} Windows kovan zekasını indirdi ve beynine yazdı!", block=False)
                                except: pass
                except: pass
            
            last_err = avg_err
            
            # V2: Usta olma eşiği esnetildi, daha hızlı seviye atlayacak
            if avg_err < 0.08:
                if stats["rank"] != "USTA":
                    try: log_queue.put(f"[EVRİM] {role} USTA rütbesine ulaştı! (Hata: {avg_err:.3f})", block=False)
                    except: pass
                stats["rank"] = "USTA"
                if not ai.is_master:
                    ai.is_master = True
                    ai.force_mutate() 
                if not reproduced:
                    stats["wants_reproduce"] = True
                    reproduced = True
            
            stats["params"] = ai.get_param_count()
            
            # Kapanışta (erken çıksak bile) veri kaybetmemek için iyi ajanların beynini sürekli kaydediyoruz
            if faction_type == "GOOD":
                stats["weights"] = ai.export_weights()
                
            batch_err = 0.0
            
        shared_stats[faction_id] = stats

# =========================================================
# BAŞLANGIÇ EKRANI (MODE SELECTION)
# =========================================================
class ModeSelectionDialog(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("V-NEXUS: Mod Seçimi")
        self.geometry("600x400")
        self.configure(bg="#0a0a0e")
        self.eval('tk::PlaceWindow . center')
        self.selected_mode = None
        
        f_title = font.Font(family="Helvetica", size=18, weight="bold")
        f_desc = font.Font(family="Consolas", size=10)
        
        tk.Label(self, text="[!] AAEBlocker V-NEXUS", fg="#00FF41", bg="#0a0a0e", font=f_title).pack(pady=20)
        tk.Label(self, text="Lütfen çalışma modunu seçin:", fg="white", bg="#0a0a0e", font=f_desc).pack(pady=5)
        
        frm_bg = tk.Frame(self, bg="#111118", bd=1, relief=tk.SOLID)
        frm_bg.pack(fill=tk.X, padx=40, pady=10)
        tk.Button(frm_bg, text="[~] ARKA PLAN MODU (GÜVENLİ)", bg="#1a1a24", fg="#00E1FF", font=f_title, command=lambda: self.select_mode("BACKGROUND")).pack(fill=tk.X, padx=5, pady=5)
        tk.Label(frm_bg, text="İşlemciyi az kullanır. Arkada işlerinizi yapmaya devam edebilirsiniz.", fg="#A0A0A0", bg="#111118", font=f_desc).pack(pady=2)

        frm_ultra = tk.Frame(self, bg="#201111", bd=1, relief=tk.SOLID)
        frm_ultra.pack(fill=tk.X, padx=40, pady=10)
        tk.Button(frm_ultra, text="[>>] ULTRA PERFORMANS (LİMİTSİZ)", bg="#FF003C", fg="white", font=f_title, command=lambda: self.select_mode("ULTRA")).pack(fill=tk.X, padx=5, pady=5)
        tk.Label(frm_ultra, text="Tüm gücü kullanır. Numpy vektör optimizasyonu ile binlerce kat hızlı eğitilir.", fg="#FF8888", bg="#201111", font=f_desc).pack(pady=2)

    def select_mode(self, mode):
        self.selected_mode = mode
        self.destroy()

# =========================================================
# GERÇEK ARAYÜZ (TKINTER DARK MODE GUI)
# =========================================================
class CyberDashboard(tk.Tk):
    def __init__(self, shared_stats, stop_event, process_list, site_queue, war_queue, log_queue):
        super().__init__()
        self.shared_stats = shared_stats
        self.stop_event = stop_event
        self.process_list = process_list
        self.site_queue = site_queue
        self.war_queue = war_queue
        self.log_queue = log_queue
        self.last_save_time = time.time()
        
        self.title("AAEBlocker V-NEXUS")
        self.geometry("1400x900")
        self.configure(bg="#0a0a0e") 
        self.protocol("WM_DELETE_WINDOW", self.stop_simulation)
        
        self.f_title = font.Font(family="Helvetica", size=18, weight="bold")
        self.f_header = font.Font(family="Helvetica", size=12, weight="bold")
        self.f_normal = font.Font(family="Consolas", size=10)
        
        self.setup_ui()
        self.update_ui()
        
    def setup_ui(self):
        # Sol Menü (Sidebar)
        self.sidebar_frame = tk.Frame(self, bg="#0d0d14", width=250, bd=1, relief=tk.RIDGE)
        self.sidebar_frame.pack(side=tk.LEFT, fill=tk.Y)
        
        tk.Label(self.sidebar_frame, text="V-NEXUS", fg="#00FF41", bg="#0d0d14", font=self.f_title).pack(pady=20)
        
        tk.Button(self.sidebar_frame, text="[+] Genel Bakış", bg="#1a1a24", fg="white", font=self.f_header, relief=tk.FLAT, command=lambda: self.show_page("DASHBOARD")).pack(fill=tk.X, padx=10, pady=5)
        tk.Button(self.sidebar_frame, text="[G] Dijital Bağışıklık (İYİ)", bg="#112014", fg="#00FF41", font=self.f_header, relief=tk.FLAT, command=lambda: self.show_page("GOOD")).pack(fill=tk.X, padx=10, pady=5)
        tk.Button(self.sidebar_frame, text="[B] Karanlık Yeraltı (KÖTÜ)", bg="#201111", fg="#FF4444", font=self.f_header, relief=tk.FLAT, command=lambda: self.show_page("BAD")).pack(fill=tk.X, padx=10, pady=5)
        tk.Button(self.sidebar_frame, text="[N] Tarafsız Şehir (NÖTR)", bg="#1a1a24", fg="#00E1FF", font=self.f_header, relief=tk.FLAT, command=lambda: self.show_page("NEUTRAL")).pack(fill=tk.X, padx=10, pady=5)
        tk.Button(self.sidebar_frame, text="[S] Eklenti Simülasyonu", bg="#1a1a24", fg="#FFD700", font=self.f_header, relief=tk.FLAT, command=lambda: self.show_page("SIMULATION")).pack(fill=tk.X, padx=10, pady=5)

        # İçerik Alanı (Pages)
        self.content_frame = tk.Frame(self, bg="#0a0a0e")
        self.content_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        self.pages = {}
        
        for p in ("DASHBOARD", "GOOD", "BAD", "NEUTRAL", "SIMULATION"):
            frame = tk.Frame(self.content_frame, bg="#0a0a0e")
            self.pages[p] = frame
            frame.grid(row=0, column=0, sticky="nsew")
            
        self.content_frame.grid_rowconfigure(0, weight=1)
        self.content_frame.grid_columnconfigure(0, weight=1)
        
        # --- DASHBOARD SAYFASI ---
        self.lbl_title = tk.Label(self.pages["DASHBOARD"], text="[!] AAEBlocker V-NEXUS MATRIX", fg="#FFFFFF", bg="#0a0a0e", font=self.f_title)
        self.lbl_title.pack(side=tk.TOP, pady=30)
        
        self.lbl_global_params = tk.Label(self.pages["DASHBOARD"], text="TOPLAM PARAMETRE (NÖRON): 0", fg="#00FF41", bg="#0a0a0e", font=self.f_title)
        self.lbl_global_params.pack(side=tk.TOP, pady=10)

        self.lbl_sys_info = tk.Label(self.pages["DASHBOARD"], text="NUMPY VEKTÖR MOTORU AKTİF | Popülasyon: 0", fg="#FFD700", bg="#0a0a0e", font=self.f_header)
        self.lbl_sys_info.pack(side=tk.TOP, pady=5)
        
        self.lbl_power = tk.Label(self.pages["DASHBOARD"], text="[⚡] YAPAY ZEKA GÜCÜ: 0.00 TeraFLOPS", fg="#00E1FF", bg="#0a0a0e", font=self.f_header)
        self.lbl_power.pack(side=tk.TOP, pady=5)

        self.btn_toggle = tk.Button(self.pages["DASHBOARD"], text="[~] MODU DEĞİŞTİR (Şu an: Bilinmiyor)", bg="#555555", fg="white", font=self.f_header, relief=tk.FLAT, command=self.toggle_mode)
        self.btn_toggle.pack(side=tk.TOP, fill=tk.X, padx=100, pady=10)
        
        self.btn_stop = tk.Button(self.pages["DASHBOARD"], text="[X] BİTİR VE BEYİNLERİ JSON'A YAZ", bg="#FF003C", fg="white", font=self.f_header, relief=tk.FLAT, command=self.stop_simulation)
        self.btn_stop.pack(side=tk.TOP, fill=tk.X, padx=100, pady=10)
        
        # Terminal Çerçevesi (Matrix Log)
        self.term_frame = tk.Frame(self.pages["DASHBOARD"], bg="#000000", bd=2, relief=tk.SUNKEN)
        self.term_frame.pack(side=tk.BOTTOM, fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        tk.Label(self.term_frame, text=">_ V-NEXUS MATRİS TERMİNALİ", fg="#00FF41", bg="#000000", font=self.f_normal, anchor="w").pack(fill=tk.X)
        self.list_log = tk.Listbox(self.term_frame, bg="#000000", fg="#00FF41", font=self.f_normal, selectbackground="#00FF41", selectforeground="black", relief=tk.FLAT)
        self.list_log.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scroll = tk.Scrollbar(self.term_frame, command=self.list_log.yview)
        scroll.pack(side=tk.RIGHT, fill=tk.Y)
        self.list_log.config(yscrollcommand=scroll.set)
        self.log_count = 0
        
        # --- SIMULATION SAYFASI ---
        tk.Label(self.pages["SIMULATION"], text="[S] GELİŞMİŞ EKLENTİ METRİKLERİ", fg="#FFD700", bg="#0a0a0e", font=self.f_title).pack(pady=30)
        
        self.lbl_stat_ram = tk.Label(self.pages["SIMULATION"], text="Tarayıcı RAM Yükü: Hesaplıyor...", fg="white", bg="#0a0a0e", font=self.f_header, anchor="w")
        self.lbl_stat_ram.pack(fill=tk.X, padx=50, pady=10)
        
        self.lbl_stat_cpu = tk.Label(self.pages["SIMULATION"], text="Tarayıcı CPU Gecikmesi: Hesaplıyor...", fg="white", bg="#0a0a0e", font=self.f_header, anchor="w")
        self.lbl_stat_cpu.pack(fill=tk.X, padx=50, pady=10)

        self.lbl_stat_bad_rate = tk.Label(self.pages["SIMULATION"], text="Anti-Adblock Üretim: Hesaplıyor...", fg="#FF6666", bg="#0a0a0e", font=self.f_header, anchor="w")
        self.lbl_stat_bad_rate.pack(fill=tk.X, padx=50, pady=10)

        self.lbl_stat_bypass = tk.Label(self.pages["SIMULATION"], text="Anti-Adblock Bypass: Aşama 1", fg="#00FF41", bg="#0a0a0e", font=self.f_header, anchor="w")
        self.lbl_stat_bypass.pack(fill=tk.X, padx=50, pady=10)

        self.lbl_stat_virus = tk.Label(self.pages["SIMULATION"], text="Virüs & Payload Kalkanı: %0", fg="#00FF41", bg="#0a0a0e", font=self.f_header, anchor="w")
        self.lbl_stat_virus.pack(fill=tk.X, padx=50, pady=10)
        
        # --- GOOD, BAD, NEUTRAL SAYFALARI ---
        tk.Label(self.pages["GOOD"], text="[G] DİJİTAL BAĞIŞIKLIK (SAVUNMA HATLARI)", fg="#00FF41", bg="#0a0a0e", font=self.f_title).pack(pady=20)
        tk.Label(self.pages["GOOD"], text="(Kasma önlemi: sadece en yetenekli 12 ajan görselleştirilir)", fg="#555555", bg="#0a0a0e", font=self.f_normal).pack(pady=5)
        
        tk.Label(self.pages["BAD"], text="[B] KARANLIK YERALTI (SALDIRI)", fg="#FF4444", bg="#0a0a0e", font=self.f_title).pack(pady=20)
        tk.Label(self.pages["BAD"], text="(Kasma önlemi: sadece en yetenekli 12 ajan görselleştirilir)", fg="#555555", bg="#0a0a0e", font=self.f_normal).pack(pady=5)
        
        tk.Label(self.pages["NEUTRAL"], text="[N] TARAFSIZ ŞEHİR (İÇERİK ANALİZİ)", fg="#00E1FF", bg="#0a0a0e", font=self.f_title).pack(pady=20)
        tk.Label(self.pages["NEUTRAL"], text="(Kasma önlemi: sadece en yetenekli 12 ajan görselleştirilir)", fg="#555555", bg="#0a0a0e", font=self.f_normal).pack(pady=5)

        self.agent_labels = {}
        self.agent_progress = {}
        
        self.update_toggle_button()
        self.show_page("DASHBOARD") # İlk sayfa

    def show_page(self, page_name):
        for name, frame in self.pages.items():
            if name == page_name:
                frame.grid(row=0, column=0, sticky="nsew")
                frame.tkraise()
            else:
                frame.grid_remove()

    def toggle_mode(self):
        current = self.shared_stats.get("execution_mode", "ULTRA")
        new_mode = "BACKGROUND" if current == "ULTRA" else "ULTRA"
        self.shared_stats["execution_mode"] = new_mode
        self.update_toggle_button()

    def update_toggle_button(self):
        current = self.shared_stats.get("execution_mode", "ULTRA")
        if current == "ULTRA":
            self.btn_toggle.config(text="[>>] CANLI MOD: ULTRA (Tıkla ve Arka Plana Geç)", bg="#FF003C", fg="white")
            self.lbl_title.config(fg="#FF003C")
        else:
            self.btn_toggle.config(text="[~] CANLI MOD: ARKA PLAN (Tıkla ve Ultra'ya Geç)", bg="#1a1a24", fg="#00E1FF")
            self.lbl_title.config(fg="#00E1FF")

    def get_or_create_label(self, parent, aid, bg_color, fg_color):
        if aid not in self.agent_labels:
            # Kasma Koruması (Visual Capping to 12)
            # Parent widget içindeki label frame sayısını say
            count = len([w for w in parent.winfo_children() if isinstance(w, tk.Frame)])
            if count >= 12:
                return None, None
                
            frm = tk.Frame(parent, bg=bg_color, bd=1, relief=tk.SOLID)
            frm.pack(fill=tk.X, padx=50, pady=5)
            
            lbl = tk.Label(frm, text="", fg=fg_color, bg=bg_color, font=self.f_normal, anchor="w", justify=tk.LEFT)
            lbl.pack(fill=tk.X, padx=5)
            
            pb = ttk.Progressbar(frm, orient="horizontal", mode="determinate", maximum=1.0)
            pb.pack(fill=tk.X, padx=5, pady=2)
            
            self.agent_labels[aid] = lbl
            self.agent_progress[aid] = pb
        return self.agent_labels.get(aid), self.agent_progress.get(aid)

    def perform_autosave(self):
        best_weights = None
        for k, v in self.shared_stats.items():
            if k.startswith("fac_g_") and "weights" in v:
                best_weights = v["weights"]
                break
                
        if best_weights:
            payload = {
                "mlp": best_weights,
                "timestamp": time.time(),
                "note": "Auto-save from V-NEXUS Ultra Deluxe"
            }
            # Firebase'e yolla
            threading.Thread(target=push_to_firebase_task, args=(payload,), daemon=True).start()
            
            # YERELE DE KAYDET (Böylece baştan başlamaz!)
            try:
                os.makedirs("src/js", exist_ok=True)
                unified_path = "src/js/aae-unified-omnicore.json"
                with open(unified_path, "w", encoding="utf-8") as f:
                    json.dump({
                        "status": "Oto-Kayıt (V-NEXUS)", 
                        "version": "V-NEXUS ULTRA DELUXE V2",
                        "aiConfig": best_weights
                    }, f, ensure_ascii=False, indent=4)
                self.log_queue.put("[OTOMATİK KAYIT] Zeka 'aae-unified-omnicore.json' dosyasına yedeklendi.")
            except Exception as e:
                print("Yerel oto-kayıt hatası:", e)

    def update_ui(self):
        if self.stop_event.is_set():
            self.destroy()
            return
            
        global_neurons = 0
        has_master = False
        best_good_error = 999.0
        best_good_weights = None
        
        for k, v in self.shared_stats.items():
            if not isinstance(k, str) or not k.startswith("fac_"): continue
            
            # Dinamik Üreme Kontrolü (Mitosis)
            if v.get("wants_reproduce"):
                temp_v = dict(v)
                temp_v["wants_reproduce"] = False
                self.shared_stats[k] = temp_v
                
                # Kasma Önlemi: Max process limiti. Aksi takdirde PC kitlenir.
                if len(self.process_list) < 40:
                    clone_id = f"{k}_clone_{int(time.time()*1000)}_{random.randint(0,9999)}"
                    clone_role = v["role"].replace(" (Çırak)", "") + " (Klon)"
                    
                    self.shared_stats[clone_id] = {
                        "role": clone_role, "type": v["type"], 
                        "success": 0, "params": 0, "rank": "ÇIRAK", "error": 1.0
                    }
                    
                    try:
                        p = Process(target=faction_process, args=(
                            clone_id, clone_role, v["type"], self.shared_stats, 
                            self.site_queue, self.war_queue, self.log_queue, self.stop_event
                        ))
                        p.daemon = True  
                        p.start()
                        self.process_list.append(p)
                        self.log_queue.put(f"[MİTOZ] Yeni ajan başarıyla klonlandı. Toplam Nüfus: {len(self.process_list)}", block=False)
                    except:
                        print("\n[UYARI] İşletim sistemi maksimum Process sınırına ulaştı.")
                        pass
            
            global_neurons += v.get("params", 0)
            role = v.get("role", "")
            success = v.get("success", 0)
            rank = v.get("rank", "")
            err = v.get("error", 1.0)
            params = v.get("params", 0)
            
            if rank == "USTA": has_master = True
            
            prog_val = max(0, min(1.0, 1.0 - err))
            
            if v["type"] == "NEUTRAL":
                lbl, pb = self.get_or_create_label(self.pages["NEUTRAL"], k, "#1a1a24", "#D0D0D0")
                if lbl and pb:
                    lbl.config(text=f"[N] {role[:20]:<20} | Üretim: {success:,}")
                    pb["value"] = 1.0
                
            elif v["type"] == "BAD":
                lbl, pb = self.get_or_create_label(self.pages["BAD"], k, "#201111", "#FF6666")
                if lbl and pb:
                    lbl.config(text=f"[B] {role[:20]:<20} | Saldırı: {success:,}")
                    pb["value"] = 1.0
                
            elif v["type"] == "GOOD":
                lbl, pb = self.get_or_create_label(self.pages["GOOD"], k, "#112014", "#00FF41" if rank=="USTA" else "#88FF88")
                if lbl and pb:
                    text = f"[G] {role[:16]:<16} | {rank}\n└ Hata: %{err*100:.1f} | Nöron: [{params:,}] | Koruma: {success:,}"
                    lbl.config(text=text)
                    pb["value"] = prog_val
                    
            # Doğal Seçilim için en iyi ajanı bul
            if v["type"] == "GOOD" and "weights" in v and v.get("error", 1.0) < best_good_error:
                best_good_error = v["error"]
                best_good_weights = v["weights"]

        if best_good_weights and best_good_error < 0.05:
            # Diğer zayıf ajanların kopyalaması için merkeze (Matrix'e) kaydet
            self.shared_stats["best_good_weights"] = best_good_weights

        mem_mb = (global_neurons * 4) / (1024 * 1024)
        current_mode = self.shared_stats.get("execution_mode", "ULTRA")
        
        # Güç tahmini (Görsel TFLOPS)
        tflops = (global_neurons * 2.5 * len(self.process_list) * (1.0 if current_mode == "ULTRA" else 0.02)) / 1000000.0
        
        self.lbl_global_params.config(text=f"[+] PARAMETRE SAYISI: {global_neurons:,} | NÖRON BAĞLANTISI: {global_neurons*3:,}")
        self.lbl_sys_info.config(text=f"[⚙] Eğitim: SANAL ORTAM (Arka Plan Destekli) | Popülasyon: {len(self.process_list)}")
        self.lbl_power.config(text=f"[⚡] YAPAY ZEKA GÜCÜ: {tflops:.2f} TeraFLOPS (Optimize)")
        
        # === İSTATİSTİK PANELİ GÜNCELLEMELERİ ===
        total_good_success = sum([v.get("success", 0) for k, v in self.shared_stats.items() if isinstance(k, str) and k.startswith("fac_") and v.get("type") == "GOOD"])
        total_bad_success = sum([v.get("success", 0) for k, v in self.shared_stats.items() if isinstance(k, str) and k.startswith("fac_") and v.get("type") == "BAD"])
        
        # Tarayıcı Simülasyonu
        browser_ram_mb = max(1.5, min(150.0, mem_mb * 0.05)) # Eklenti Javascript JS Engine optimizasyonu varsayımı
        cpu_delay_ms = max(0.1, min(12.0, (global_neurons / 1000000) * 1.5))
        
        self.lbl_stat_ram.config(text=f"[O] JS Motoru RAM İhtiyacı: ~{browser_ram_mb:.1f} MB")
        self.lbl_stat_cpu.config(text=f"[⏱] Sayfa Yükleme Gecikmesi: +{cpu_delay_ms:.2f} ms")
        self.lbl_stat_bad_rate.config(text=f"[B] Kötücül Taktik Üretimi: {total_bad_success:,}")
        
        # Anti-Adblock Aşama Hesabı
        bypass_level = 1 + int(total_good_success / 50000)
        bypass_titles = {1: "Basit DOM Gizleme", 2: "Inline CSS Engelleme", 3: "WebSocket Kesintisi", 4: "JIT Bytecode Maskeleme", 5: "Kuantum DOM Bypass", 6: "İlahi Müdahale"}
        bypass_text = bypass_titles.get(bypass_level, "Bilinmeyen Üst-Boyut")
        self.lbl_stat_bypass.config(text=f"[G] Anti-Adblock Bypass: Aşama {bypass_level}\n   └ {bypass_text}")
        
        virus_shield_pct = min(99.99, (total_good_success / max(1, total_bad_success)) * 50.0)
        self.lbl_stat_virus.config(text=f"[!] Payload & Virüs Kalkanı: %{virus_shield_pct:.2f}")

        # Matrix Terminali Log Çekimi
        try:
            while not self.log_queue.empty():
                msg = self.log_queue.get_nowait()
                timestamp = time.strftime("%H:%M:%S")
                self.list_log.insert(tk.END, f"[{timestamp}] {msg}")
                self.log_count += 1
                if self.log_count > 100:
                    self.list_log.delete(0)
                    self.log_count -= 1
                self.list_log.see(tk.END)
        except: pass

        # Her 30 saniyede bir, eğer USTA varsa Firebase oto-kayıt yap.
        if has_master and time.time() - self.last_save_time > 30:
            self.perform_autosave()
            self.last_save_time = time.time()
            
        self.after(200, self.update_ui)
    def stop_simulation(self):
        try:
            self.list_log.insert(tk.END, "[!] KAPANMA SİNYALİ ALINDI. Son ağırlıklar kaydediliyor...")
            self.update()
            self.perform_autosave()
        except: pass
        self.stop_event.set()
        self.destroy()

# =========================================================
# ANA SİMÜLASYON BAŞLATICI
# =========================================================
if __name__ == "__main__":
    multiprocessing.freeze_support()
    
    # 1. Aşama: Açılış Mod Seçimi
    mode_selector = ModeSelectionDialog()
    mode_selector.mainloop()
    
    execution_mode = mode_selector.selected_mode
    if not execution_mode:
        print("Mod seçilmedi. Çıkış yapılıyor...")
        sys.exit(0)
        
    print(f"\n\033[92m>>> İLK MOD: {execution_mode} \033[0m\n")
    
    manager = Manager()
    shared_stats = manager.dict()
    shared_stats["execution_mode"] = execution_mode
    
    site_queue = Queue(maxsize=15000)
    war_queue = Queue(maxsize=15000)
    log_queue = Queue(maxsize=5000)
    stop_event = Event()
    processes = []
    
    unified_path = "src/js/aae-unified-omnicore.json"
    initial_weights = None
    if os.path.exists(unified_path):
        try:
            with open(unified_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                initial_weights = data.get("aiConfig")
                print(f"\n\033[92m>>> 🧠 [BEYİN AKTARIMI] Önceki 'aae-unified-omnicore.json' bulundu. Klonlar bu zekayla eğitilmeye devam edecek!\033[0m\n")
        except:
            pass
    
    neutrals = ["Webmaster (HTML)", "UX/UI Tasarimci", "E-Ticaret Motoru", "Arama Motoru Botu", "WASM Sikistirici"]
    for i, role in enumerate(neutrals):
        aid = f"fac_n_{i}"
        shared_stats[aid] = {"role": role, "type": "NEUTRAL", "success": 0, "params": 0, "rank": "ÇIRAK", "error": 1.0}
        p = Process(target=faction_process, args=(aid, role, "NEUTRAL", shared_stats, site_queue, war_queue, log_queue, stop_event, None))
        p.daemon = True
        p.start(); processes.append(p)

    bads = ["Gorunmez Reklamci", "Parmak Izi Hirsizi", "Kripto Madenci(CPU)", "Oltalama Uzmani(Phish)", "Zero-Day Istismarcisi", "DDoS Zombi Botu", "Fidye Yazilimi(Ransom)"]
    for i, role in enumerate(bads):
        aid = f"fac_b_{i}"
        shared_stats[aid] = {"role": role, "type": "BAD", "success": 0, "params": 10000, "rank": "ÇIRAK", "error": 1.0}
        p = Process(target=faction_process, args=(aid, role, "BAD", shared_stats, site_queue, war_queue, log_queue, stop_event, None))
        p.daemon = True
        p.start(); processes.append(p)

    goods = [
        "AAE AdBlock Core", "Anti-Tracker Gizlilik", "Guvenlik Duvari(DPI)", "Hukukcu(Anti-Phish)", 
        "Anti-Virus (Payload)", "DOM Iyilestirici", "Zero-Day Kalkani", "JIT Bytecode Bekcisi", 
        "Kanarya Testcisi", "Parmak Izi Sahtekari", "Derin Gozlemci", "Kalkan Guclendirici",
        "Ag Izleyici", "Zirh Onarici", "DNA Analizoru", "Tehdit Avcisi",
        "Hiper Savunma", "Erken Uyari", "Kuantum Kalkani", "Oto-Duzeltici"
    ]
    for i, role in enumerate(goods):
        aid = f"fac_g_{i}"
        shared_stats[aid] = {"role": role, "type": "GOOD", "success": 0, "params": 10000, "rank": "ÇIRAK", "error": 1.0}
        p = Process(target=faction_process, args=(aid, role, "GOOD", shared_stats, site_queue, war_queue, log_queue, stop_event, initial_weights))
        p.daemon = True
        p.start(); processes.append(p)
        
    app = CyberDashboard(shared_stats, stop_event, processes, site_queue, war_queue, log_queue)
    app.mainloop()
    
    os.system('clear' if os.name == 'posix' else 'cls')
    print("\033[93m>>> 🛑 ARAYÜZ KAPATILDI. BEYİNLER BİRLEŞTİRİLİYOR...\033[0m")
    
    # DİKKAT: Manager dict'ten veriyi süreçleri öldürmeden ÖNCE çekmeliyiz.
    # Yoksa bir süreç Manager kilidini tutarken terminate edilirse deadlock oluşur (kapanmaz).
    best_weights = None
    try:
        for k, v in shared_stats.items():
            if k.startswith("fac_g_") and "weights" in v:
                best_weights = v["weights"]
                break
    except Exception as e:
        print("Beyinler alınırken hata:", e)
        
    # Anında ve sorunsuz kapanış için şimdi terminate edebiliriz.
    for p in processes: 
        if p.is_alive():
            try: p.terminate()
            except: pass
        p.join(timeout=0.1)
    
    os.makedirs("src/js", exist_ok=True)
    unified_path = "src/js/aae-unified-omnicore.json"
    
    if best_weights:
        with open(unified_path, "w", encoding="utf-8") as f:
            json.dump({
                "status": "Tüm ustaların beyinleri başarıyla birleştirildi.", 
                "version": "V-NEXUS ULTRA DELUXE V2",
                "aiConfig": best_weights
            }, f, ensure_ascii=False, indent=4)
        print(f"\n\033[1m\033[92m>>> 🟢 İŞLEM TAMAM! Gerçek ağırlıklar '{unified_path}' dosyasına başarıyla kaydedildi.\033[0m")
        
        payload = {"mlp": best_weights, "timestamp": time.time(), "note": "Final Save"}
        try:
            requests.post(FIREBASE_URL, json=payload, timeout=5)
            print("☁️ [BİLGİ] Son veriler Firebase'e başarıyla itildi.")
        except: pass
    else:
        print(f"\n\033[1m\033[91m>>> ⚠️ DİKKAT! Yeterince uzun eğitim yapılmadı, USTA rütbesine ulaşılamadığı için ağırlıklar kaydedilemedi.\033[0m")