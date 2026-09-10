import json, random, math, time, os, sys, itertools
import multiprocessing
from multiprocessing import Process, Manager, Queue, Event

# =========================================================
# AAEBlocker - V-ULTIMA OMNIVERSE (3X OVERCLOCK EDITION)
# 33 Meslek | Tarayıcı Çekirdeği Kalkanı | 250 Sensör
# =========================================================

if os.environ.get("AAE_AWAKE") != "1":
    os.environ["AAE_AWAKE"] = "1"
    try: os.execvp("systemd-inhibit", ["systemd-inhibit", "--what=sleep:idle", "--who=AAE_ULTIMA", "--why=Cyber_Immunity", sys.executable, sys.argv[0]])
    except: pass

INPUT_SIZE = 250 # V8, WebGL, Canvas, JIT bytecode sensörleri eklendi
MAX_H1, MAX_H2, MAX_H3 = 512, 256, 128 # Beyin kapasitesi 2 katına çıkarıldı
OUTPUT_SIZE = 1 

class DynamicMLP:
    def __init__(self):
        self.lr = 0.15 # 3X ÖĞRENME HIZI (Eskiden 0.05'ti)
        self.active_h1, self.active_h2, self.active_h3 = 64, 32, 16
        self.is_master = False 
        
        self.w1 = [[random.uniform(-0.1, 0.1) for _ in range(MAX_H1)] for _ in range(INPUT_SIZE)]
        self.b1 = [random.uniform(-0.1, 0.1) for _ in range(MAX_H1)]
        self.w2 = [[random.uniform(-0.1, 0.1) for _ in range(MAX_H2)] for _ in range(MAX_H1)]
        self.b2 = [random.uniform(-0.1, 0.1) for _ in range(MAX_H2)]
        self.w3 = [[random.uniform(-0.1, 0.1) for _ in range(MAX_H3)] for _ in range(MAX_H2)]
        self.b3 = [random.uniform(-0.1, 0.1) for _ in range(MAX_H3)]
        self.w4 = [[random.uniform(-0.1, 0.1) for _ in range(OUTPUT_SIZE)] for _ in range(MAX_H3)]
        self.b4 = [random.uniform(-0.1, 0.1) for _ in range(OUTPUT_SIZE)]

    def check_promotion(self, current_error):
        # 3X Hızlandırılmış Terfi (Eskiden çok bekliyordu, şimdi %5 hata yetiyor)
        if not self.is_master and current_error < 0.05:
            self.is_master = True
            self.active_h1, self.active_h2, self.active_h3 = MAX_H1, MAX_H2, MAX_H3
            return True
        return False

    def get_param_count(self):
        return (INPUT_SIZE * self.active_h1 + self.active_h1) + \
               (self.active_h1 * self.active_h2 + self.active_h2) + \
               (self.active_h2 * self.active_h3 + self.active_h3) + \
               (self.active_h3 * OUTPUT_SIZE + OUTPUT_SIZE)

    def train(self, inputs, target_val):
        h1, h2, h3 = self.active_h1, self.active_h2, self.active_h3
        
        z1 = [sum(inputs[i] * self.w1[i][j] for i in range(INPUT_SIZE)) + self.b1[j] for j in range(h1)]
        a1 = [x if x > 0 else 0.01 * x for x in z1]
        z2 = [sum(a1[i] * self.w2[i][j] for i in range(h1)) + self.b2[j] for j in range(h2)]
        a2 = [x if x > 0 else 0.01 * x for x in z2]
        z3 = [sum(a2[i] * self.w3[i][j] for i in range(h2)) + self.b3[j] for j in range(h3)]
        a3 = [x if x > 0 else 0.01 * x for x in z3]
        
        val = sum(a3[i] * self.w4[i][0] for i in range(h3)) + self.b4[0]
        out = 1.0 / (1.0 + math.exp(-max(-10, min(10, val))))
            
        err = target_val - out
        d4 = err * (out * (1.0 - out))
        
        d3 = [d4 * self.w4[j][0] * (1.0 if a3[j] > 0 else 0.01) for j in range(h3)]
        d2 = [sum(d3[k] * self.w3[j][k] for k in range(h3)) * (1.0 if a2[j] > 0 else 0.01) for j in range(h2)]
        d1 = [sum(d2[k] * self.w2[j][k] for k in range(h2)) * (1.0 if a1[j] > 0 else 0.01) for j in range(h1)]

        for i in range(h3): self.w4[i][0] += self.lr * d4 * a3[i]
        self.b4[0] += self.lr * d4
        for i in range(h2):
            for j in range(h3): self.w3[i][j] += self.lr * d3[j] * a2[i]
            self.b3[i] += self.lr * d2[i]
        for i in range(h1):
            for j in range(h2): self.w2[i][j] += self.lr * d2[j] * a1[i]
            self.b2[i] += self.lr * d1[i]
        for i in range(INPUT_SIZE):
            for j in range(h1): self.w1[i][j] += self.lr * d1[j] * inputs[i]
        for j in range(h1): self.b1[j] += self.lr * d1[j]

        return abs(err), out

    def extract_weights(self):
        return {"w1": self.w1, "b1": self.b1, "w2": self.w2, "b2": self.b2, "w3": self.w3, "b3": self.b3, "w4": self.w4, "b4": self.b4}

# =========================================================
# FRAKSİYON LİDERLERİ
# =========================================================
def faction_process(faction_id, role, faction_type, shared_stats, site_queue, war_queue, stop_event):
    if faction_type == "GOOD":
        try: os.nice(0) 
        except: pass
    elif faction_type == "BAD":
        try: os.nice(5) 
        except: pass
    else:
        try: os.nice(10) 
        except: pass

    population = [{"ai": DynamicMLP(), "iters": 0, "batch_err": 0.0}]
    MAX_POPULATION = 5 
    
    stats = {"role": role, "type": faction_type, "scanned": 0, "success": 0, "masters": 0, "apprentices": 1, "total_neurons": 0}
    
    while not stop_event.is_set():
        global_throttle = shared_stats.get("THROTTLE", 0.0)
        if global_throttle > 0: time.sleep(global_throttle)
        
        # 3X HIZ: Her döngüde daha büyük veriler işlenir
        try: page = site_queue.get(timeout=0.01) if faction_type == "BAD" else war_queue.get(timeout=0.01)
        except: 
            if faction_type == "NEUTRAL": 
                page = []
                for _ in range(30): # 3X Hızlandırılmış Veri Üretimi
                    inputs = [random.uniform(0.0, 0.2) for _ in range(INPUT_SIZE)]
                    inputs[0] = 1.0 
                    page.append({"type": "organic", "data": inputs})
                try: site_queue.put(page, block=False); war_queue.put(page, block=False)
                except: pass
                stats["success"] += 1 
                shared_stats[faction_id] = stats
            continue
            
        if faction_type == "BAD":
            for _ in range(6): # 3X Hızlandırılmış Saldırı
                data = [random.uniform(0.5, 1.0) for _ in range(INPUT_SIZE)]
                page.insert(random.randint(0, len(page)), {"type": role, "data": data})
            try: war_queue.put(page, block=False)
            except: pass
            stats["success"] += 6

        total_neurons = 0
        masters_count = 0
        
        for agent in population:
            ai = agent["ai"]
            target_type = role
            
            for el in page:
                is_target = (el["type"] == target_type)
                target_val = 1.0 if is_target else 0.0
                
                if faction_type == "BAD": break 
                
                err, out = ai.train(el["data"], target_val)
                agent["batch_err"] += err
                stats["scanned"] += 1
                if is_target and out > 0.75: stats["success"] += 1
                
            agent["iters"] += 1
            total_neurons += ai.get_param_count()
            if ai.is_master: masters_count += 1
            
            # 3X HIZ: Her 15 sayfada bir Ustalık Kontrolü (Eskiden 50'ydi)
            if agent["iters"] % 15 == 0 and faction_type != "BAD":
                avg_err = agent["batch_err"] / max(1, (15 * len(page)))
                if ai.check_promotion(avg_err):
                    masters_count += 1
                    
                # Hızlı Üreme
                if ai.is_master and len(population) < MAX_POPULATION and random.random() < 0.4:
                    population.append({"ai": DynamicMLP(), "iters": 0, "batch_err": 0.0})
                    
                agent["batch_err"] = 0.0

        stats["masters"] = masters_count
        stats["apprentices"] = len(population) - masters_count
        stats["total_neurons"] = total_neurons
        
        if masters_count > 0:
            stats["best_brain"] = population[0]["ai"].extract_weights()
            
        shared_stats[faction_id] = stats

# =========================================================
# V-ULTIMA DASHBOARD (DEVASA 3 SÜTUN UI)
# =========================================================
def draw_dashboard(shared_stats, stop_event):
    start_time = time.time()
    os.system('clear')
    
    while not stop_event.is_set():
        elapsed = int(time.time() - start_time)
        
        global_neurons = 0
        good_stats, bad_stats, neutral_stats = [], [], []
        
        for k, v in shared_stats.items():
            if isinstance(k, str) and k.startswith("fac_"):
                global_neurons += v.get("total_neurons", 0)
                if v["type"] == "GOOD": good_stats.append(v)
                elif v["type"] == "BAD": bad_stats.append(v)
                elif v["type"] == "NEUTRAL": neutral_stats.append(v)

        mem_mb = (global_neurons * 4) / (1024 * 1024)
        throttle = 0.0
        gov_status = "\033[92mGÜVENLİ\033[0m"
        
        # Limitler 3 katına çıkarıldı (Overclock)
        if global_neurons > 600000:
            throttle = 0.005; gov_status = "\033[93mDİKKAT (Isınma)\033[0m"
        if global_neurons > 1200000:
            throttle = 0.02; gov_status = "\033[91mKRİTİK (Limitör)\033[0m"
        
        shared_stats["THROTTLE"] = throttle
        
        sys.stdout.write("\033[H")
        ui = f"""\033[96m
==================================================================================================================================
           🌍 AAEBlocker OMNIVERSE (3X OVERCLOCK) | Tarayıcı Çekirdeği Simülasyonu | Süre: {elapsed}s | Sensör: {INPUT_SIZE}
==================================================================================================================================
 ⚡ EĞİTİM HIZI: 300% (Turbo) | Toplam Nöron: {global_neurons:,} | Beklenen RAM: {mem_mb:.1f} MB | Donanım Valisi: {gov_status}
----------------------------------------------------------------------------------------------------------------------------------
 \033[94m⚙️ ŞEHİR & EKOSİSTEM (Tarafsız)\033[97m           |\033[91m 🔴 KARANLIK YERALTI (Saldırı)\033[97m           |\033[92m 🟢 DİJİTAL BAĞIŞIKLIK (Savunma)\033[0m
------------------------------------------|-----------------------------------------|---------------------------------------------"""

        max_rows = max(len(good_stats), len(bad_stats), len(neutral_stats))
        
        for i in range(max_rows):
            g_str = ""
            if i < len(good_stats):
                v = good_stats[i]
                g_str = f"{v['role'][:25]:<25} 👑{v['masters']:<1} 👶{v['apprentices']:<1} 🎯{v['success']:<4}"
            
            b_str = ""
            if i < len(bad_stats):
                v = bad_stats[i]
                b_str = f"{v['role'][:25]:<25} ☠️ {v['success']:<4}"
                
            n_str = ""
            if i < len(neutral_stats):
                v = neutral_stats[i]
                n_str = f"{v['role'][:25]:<25} 📄 {v['success']:<4}"

            ui += f"\n \033[94m{n_str:<40} \033[97m|\033[91m {b_str:<39} \033[97m|\033[92m {g_str:<42}\033[0m"

        ui += f"""
==================================================================================================================================
\033[93m💡 SİSTEM 3 KAT HIZLANDIRILDI! Çıraklar artık çok daha hızlı öğreniyor ve beyin hücreleri 512 Katmana kadar genişliyor. \033[0m
\033[91m>>> [ENTER] TUŞUNA BASARAK SİMÜLASYONU BİTİR VE TÜM USTALARI TEK (UNIFIED) DOSYADA BİRLEŞTİR <<<\033[0m
\033[J"""
        sys.stdout.write(ui)
        sys.stdout.flush()
        time.sleep(0.1) # UI Yenileme Hızı da artırıldı

def input_listener(stop_event):
    input()
    stop_event.set()

if __name__ == "__main__":
    multiprocessing.freeze_support()
    manager = Manager()
    shared_stats = manager.dict()
    shared_stats["THROTTLE"] = 0.0
    
    site_queue = Queue(maxsize=15000)
    war_queue = Queue(maxsize=15000)
    stop_event = Event()
    processes = []
    
    # 1. TARAFSIZLAR (ŞEHİR, 8 Meslek)
    neutrals = [
        "👨‍💻 Webmaster (HTML)", "🎨 UX/UI Tasarımcı", "🛒 E-Ticaret Motoru", 
        "🤖 Arama Motoru Botu", "🧑‍💼 Sıradan Kullanıcı", "📰 Haber Portalı AI",
        "🗜️ WASM Sıkıştırıcı", "⚖️ Adalet Divanı(Hakem)"
    ]
    for i, role in enumerate(neutrals):
        aid = f"fac_n_{i}"
        shared_stats[aid] = {"role": role, "type": "NEUTRAL", "success": 0, "masters": 0, "apprentices": 0, "total_neurons": 0}
        p = Process(target=faction_process, args=(aid, role, "NEUTRAL", shared_stats, site_queue, war_queue, stop_event))
        p.start(); processes.append(p)

    # 2. KÖTÜLER (KARANLIK, 12 Meslek)
    bads = [
        "🧛 Görünmez Reklamcı", "🕵️ Parmak İzi Hırsızı", "⛏️ Kripto Madenci(CPU)", 
        "🎣 Oltalama Uzmanı(Phish)", "🦠 Zero-Day İstismarcısı", "🪱 Bellek Solucanı",
        "🌐 DDoS Zombi Botu", "🔑 Fidye Yazılımı(Ransom)", "🎨 CSS Houdini Hacker",
        "🧟 ServiceWorker Casusu", "🖱️ İnsan Kaydırma Botu", "🖼️ WebGL Shader Steno"
    ]
    for i, role in enumerate(bads):
        aid = f"fac_b_{i}"
        shared_stats[aid] = {"role": role, "type": "BAD", "success": 0, "masters": 0, "apprentices": 0, "total_neurons": 0}
        p = Process(target=faction_process, args=(aid, role, "BAD", shared_stats, site_queue, war_queue, stop_event))
        p.start(); processes.append(p)

    # 3. İYİLER (BAĞIŞIKLIK SİSTEMİ, 13 Meslek)
    goods = [
        "🛡️ AAE AdBlock Core", "🥷 Anti-Tracker Gizlilik", "🔥 Güvenlik Duvarı(DPI)", 
        "⚖️ Hukukçu(Anti-Phish)", "🚑 Anti-Virüs (Payload)", "🧩 DOM İyileştirici",
        "🧠 Zero-Day Kalkanı", "🛡️ Bellek Koruma Birimi", "⚙️ JIT Bytecode Bekçisi",
        "🕊️ Kanarya Testçisi", "🎭 Parmak İzi Sahtekarı", "🚪 İzin Muhafızı(API)", 
        "📡 CNAME Tünel Avcısı"
    ]
    for i, role in enumerate(goods):
        aid = f"fac_g_{i}"
        shared_stats[aid] = {"role": role, "type": "GOOD", "success": 0, "masters": 0, "apprentices": 1, "total_neurons": 5000}
        p = Process(target=faction_process, args=(aid, role, "GOOD", shared_stats, site_queue, war_queue, stop_event))
        p.start(); processes.append(p)
        
    import threading
    threading.Thread(target=draw_dashboard, args=(shared_stats, stop_event), daemon=True).start()
    threading.Thread(target=input_listener, args=(stop_event,), daemon=True).start()
    
    stop_event.wait()
    for p in processes: p.join()
    
    os.system('clear')
    print("\033[93m>>> 🛑 OVERCLOCK SİMÜLASYONU DURDURULDU. OMNIVERSE BEYİNLERİ TOPLANIYOR...\033[0m")
    
    unified_brain = {}
    for k, v in shared_stats.items():
        if v.get("type") == "GOOD" and "best_brain" in v:
            clean_name = v["role"].split(" ", 1)[1] if " " in v["role"] else v["role"]
            unified_brain[clean_name] = v["best_brain"]
            print(f"\033[92m[+] {clean_name} Ustası Kolektif Zekaya Eklendi.\033[0m")
            
    os.makedirs("src/js", exist_ok=True)
    unified_path = "src/js/aae-unified-omnicore.json"
    with open(unified_path, "w", encoding="utf-8") as f:
        json.dump(unified_brain, f, indent=2)
        
    print(f"\n\033[1m\033[96m>>> 🟢 İŞLEM TAMAM! 13 Farklı Savunma Uzmanı tek bedende birleşti.\033[0m")
    print(f"\033[96m>>> Çıktı Dosyası: {unified_path}\033[0m")
