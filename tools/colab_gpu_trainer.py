# ==============================================================================
# AAEBlocker V-NEXUS V8 (ALPHASTAR LEAGUE, WGAN-GP, CURRICULUM LEARNING)
# V8: Tarihi Hacker Arşivi (Unutmayı Önler), WGAN-GP Stabilizasyonu, Dinamik Zorluk
# ==============================================================================

import os
import sys
import time
import json
import random
import threading
import collections
import copy
import math
import numpy as np

os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# ==============================================================================
# 1. BAĞIMLILIK KONTROLÜ VE KURULUMLAR
# ==============================================================================
try:
    import onnx
    import onnxscript
except ImportError:
    os.system("pip install onnx onnxscript")
    import onnx
    import onnxscript

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    import torch.nn.utils.prune as prune
except ImportError:
    os.system("pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118")
    import torch
    import torch.nn as nn
    import torch.optim as optim
    import torch.nn.utils.prune as prune

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("[*] Chrome Tarayıcı ve WebDriver Colab için kuruluyor. Lütfen bekleyin...")
    os.system("wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -")
    os.system("echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' > /etc/apt/sources.list.d/google-chrome.list")
    os.system("apt-get update")
    os.system("apt-get install -y google-chrome-stable chromium-chromedriver")
    os.system("pip install selenium webdriver-manager")
    
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from webdriver_manager.chrome import ChromeDriverManager

try:
    from IPython.display import clear_output
    from google.colab import drive
    IN_COLAB = True
    drive.mount('/content/drive', force_remount=False)
    DRIVE_LOAD_V4 = "/content/drive/MyDrive/aae-omniverse-v4-agi.json"
    DRIVE_SAVE_PATH = "/content/drive/MyDrive/aae-omniverse-v8-nexus.pth"
    ONNX_SEC_PATH = "/content/drive/MyDrive/security_core.onnx"
except ImportError:
    def clear_output(wait=False):
        os.system('cls' if os.name == 'nt' else 'clear')
    IN_COLAB = False
    DRIVE_LOAD_V4 = "aae-omniverse-v4-agi.json"
    DRIVE_SAVE_PATH = "aae-omniverse-v8-nexus.pth"
    ONNX_SEC_PATH = "security_core.onnx"

if not torch.cuda.is_available():
    print("❌ CRITICAL ERROR: CUDA GPU bulunamadı!")
    sys.exit(1)

device = torch.device('cuda')
torch.backends.cudnn.benchmark = True 

# ==============================================================================
# 2. HİPERPARAMETRELER
# ==============================================================================
DOM_INPUT_SIZE = 512
SCRIPT_START_IDX = 280
SCRIPT_END_IDX = 450
SCRIPT_SIZE = SCRIPT_END_IDX - SCRIPT_START_IDX
STRUCT_SIZE = DOM_INPUT_SIZE - SCRIPT_SIZE

BATCH_SIZE = 16384     
NOISE_DIM = 128

# ==============================================================================
# 3. V8 MİMARİSİ (WGAN-GP RESIDUAL)
# ==============================================================================

class ResidualBlock(nn.Module):
    def __init__(self, size):
        super(ResidualBlock, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(size, size),
            nn.LayerNorm(size),
            nn.SiLU(),
            nn.Linear(size, size),
            nn.LayerNorm(size)
        )
    def forward(self, x):
        return nn.functional.silu(x + self.net(x))

# ----------------- KIRMIZI TAKIM (HACKER) -----------------
class HackerBotGenerator(nn.Module):
    def __init__(self):
        super(HackerBotGenerator, self).__init__()
        
        self.obfuscator = nn.Sequential(
            nn.Linear(NOISE_DIM // 2 + SCRIPT_SIZE, 512),
            nn.SiLU(),
            nn.Linear(512, SCRIPT_SIZE),
            nn.Tanh() 
        )
        
        self.spoofer = nn.Sequential(
            nn.Linear(NOISE_DIM // 2 + STRUCT_SIZE, 512),
            nn.SiLU(),
            nn.Linear(512, STRUCT_SIZE),
            nn.Tanh()
        )
        
        self.mastermind = nn.Sequential(
            nn.Linear(DOM_INPUT_SIZE, 1024),
            nn.SiLU(),
            nn.Linear(1024, DOM_INPUT_SIZE),
            nn.Tanh()
        )

    def forward(self, noise, clean_dom, scale=0.25):
        noise_obf = noise[:, :NOISE_DIM//2]
        noise_spoof = noise[:, NOISE_DIM//2:]
        
        clean_script = clean_dom[:, SCRIPT_START_IDX:SCRIPT_END_IDX]
        clean_struct = torch.cat([clean_dom[:, :SCRIPT_START_IDX], clean_dom[:, SCRIPT_END_IDX:]], dim=1)
        
        shift_script = self.obfuscator(torch.cat([noise_obf, clean_script], dim=1)) * scale
        shift_struct = self.spoofer(torch.cat([noise_spoof, clean_struct], dim=1)) * scale
        
        fake_script = clean_script + shift_script
        fake_struct = clean_struct + shift_struct
        
        assembled_dom = torch.cat([
            fake_struct[:, :SCRIPT_START_IDX],
            fake_script,
            fake_struct[:, SCRIPT_START_IDX:]
        ], dim=1)
        
        final_shift = self.mastermind(assembled_dom) * (scale * 0.8)
        final_fake = assembled_dom + final_shift
        
        return torch.clamp(final_fake, 0.0, 1.0)

# ----------------- MAVİ TAKIM (SENTINEL AGI) -----------------
class OmniversalSentinel(nn.Module):
    def __init__(self):
        super(OmniversalSentinel, self).__init__()
        
        self.script_analyzer = nn.Sequential(
            nn.Linear(SCRIPT_SIZE, 1024),
            nn.SiLU(),
            ResidualBlock(1024),
            nn.Linear(1024, 512),
            nn.SiLU()
        )
        
        self.dom_analyzer = nn.Sequential(
            nn.Linear(STRUCT_SIZE, 1024),
            nn.SiLU(),
            ResidualBlock(1024),
            nn.Linear(1024, 512),
            nn.SiLU()
        )
        
        self.aggregator = nn.Sequential(
            nn.Linear(1024, 2048),
            nn.SiLU(),
            ResidualBlock(2048),
            nn.Linear(2048, 1024),
            nn.SiLU(),
            nn.Linear(1024, 1) # WGAN için Linear çıktı (Sigmoid YOK)
        )

        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_in', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)

    def forward(self, x_dom):
        x_script = x_dom[:, SCRIPT_START_IDX:SCRIPT_END_IDX]
        x_struct = torch.cat([x_dom[:, :SCRIPT_START_IDX], x_dom[:, SCRIPT_END_IDX:]], dim=1)
        
        script_features = self.script_analyzer(x_script)
        dom_features = self.dom_analyzer(x_struct)
        
        combined = torch.cat([script_features, dom_features], dim=1)
        return self.aggregator(combined)

    def import_v4_weights(self, filepath):
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
                if "aiConfig" in data:
                    js_data = data["aiConfig"]
                else:
                    return False
            return True
        except Exception:
            return False

# ==============================================================================
# 4. OTONOM İNTERNET GEZGİNİ
# ==============================================================================
real_dom_buffer = collections.deque(maxlen=200000)
url_frontier = collections.deque(maxlen=5000)
visited_urls = set()

SEED_URLS = [
    "https://tr.wikipedia.org/wiki/Yapay_zeka",
    "https://www.donanimhaber.com",
    "https://github.com/torvalds/linux", 
    "https://stackoverflow.com/questions",
    "https://www.webtekno.com"
]
url_frontier.extend(SEED_URLS)

hunter_status = "Hazırlanıyor..."
current_url = "Başlatılıyor..."
pages_visited = 0
export_status = "BEKLENİYOR"

JS_EXTRACTOR = """
    const INPUT_SIZE = 512;
    let results = [];
    let elements = Array.from(document.querySelectorAll('*')).sort(() => 0.5 - Math.random()).slice(0, 200);
    
    for (let el of elements) {
        let f = new Array(INPUT_SIZE).fill(0.0);
        try {
            let rect = el.getBoundingClientRect();
            let comp = window.getComputedStyle(el);
            let htmlStr = el.outerHTML || "";
            let cName = (el.className || "").toString().toLowerCase();
            let idName = (el.id || "").toString().toLowerCase();
            let srcHref = (el.src || el.href || "").toString().toLowerCase();
            
            f[0] = Math.min(1.0, rect.width / 2000.0);
            f[1] = Math.min(1.0, rect.height / 2000.0);
            f[2] = comp.display === 'none' ? 1.0 : 0.0;
            f[3] = comp.position === 'fixed' || comp.position === 'absolute' ? 1.0 : 0.0;
            f[51] = srcHref.includes("googleads") || srcHref.includes("doubleclick") ? 1.0 : 0.0;
            f[55] = cName.includes("sponsor") || idName.includes("sponsor") ? 1.0 : 0.0;
            f[151] = el.tagName.toLowerCase() === 'iframe' ? 1.0 : 0.0;
            f[281] = htmlStr.includes("eval(") ? 1.0 : 0.0;
            f[402] = htmlStr.includes("debugger") ? 1.0 : 0.0;
            
            let threat_score = 0.0;
            if (f[51] > 0 || f[151] > 0) threat_score += 0.4;
            if (f[281] > 0 || f[402] > 0) threat_score += 0.5;
            if (f[55] > 0) threat_score += 0.5;
            let label = Math.min(1.0, threat_score);
            
            results.push({f: f, y: label});
        } catch (e) {}
    }
    return results;
"""

def create_webdriver():
    global hunter_status
    try:
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        
        # Colab/Linux için doğru binary yolunu ayarlıyoruz
        if os.path.exists('/usr/bin/chromium-browser'):
            options.binary_location = '/usr/bin/chromium-browser'
        elif os.path.exists('/usr/bin/google-chrome'):
            options.binary_location = '/usr/bin/google-chrome'
        
        service = None
        for sys_path in ['/usr/bin/chromedriver', '/usr/lib/chromium-browser/chromedriver']:
            if os.path.exists(sys_path):
                service = Service(sys_path)
                break
                
        if service is None:
            try:
                service = Service(ChromeDriverManager().install())
            except Exception:
                service = Service()
                
        driver = webdriver.Chrome(service=service, options=options)
        driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
            'source': '''
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                })
            '''
        })
        return driver
    except Exception as e:
        # Colab'da bazen driver bozulabilir, otomatik onarım (apt-get) deneyelim:
        if "chromedriver unexpectedly exited" in str(e) or "Service" in str(e):
            hunter_status = "Chrome Kuruluyor (apt-get install chromium-chromedriver)..."
            os.system("apt-get update && apt-get install -y chromium-chromedriver")
            
            # Sadece bir kez onarmayı dene
            try:
                service = Service('/usr/bin/chromedriver')
                driver = webdriver.Chrome(service=service, options=options)
                return driver
            except Exception as e2:
                hunter_status = f"Chrome Onarımı Başarısız: {str(e2)[:40]}"
                return None
                
        hunter_status = f"Chrome Hatası: {str(e)[:40]}"
        return None

lock = threading.Lock()

def hunter_bot_worker():
    global hunter_status, current_url, pages_visited
    driver = None
    try:
        hunter_status = "Tarayıcı Başlatılıyor..."
        driver = create_webdriver()
        
        while True:
            if driver is None:
                time.sleep(5)
                driver = create_webdriver()
                if driver is None:
                    continue
                    
            if pages_visited > 0 and pages_visited % 20 == 0:
                hunter_status = "RAM Temizliği..."
                try: driver.quit()
                except: pass
                driver = create_webdriver()
                
            if len(url_frontier) == 0:
                url_frontier.extend(SEED_URLS)
            if len(url_frontier) == 0:
                time.sleep(1)
                continue
                
            target = url_frontier.popleft()
            if target in visited_urls:
                continue
                
            visited_urls.add(target)
            current_url = target
            hunter_status = "Sayfa Analizi (Reklamlar & Metinler)..."
            
            try:
                driver.get(target)
                time.sleep(1)
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight/3);")
                time.sleep(1)
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
                
                dom_data = driver.execute_script(JS_EXTRACTOR)
                
                elements = driver.find_elements(By.XPATH, "//a")
                links_found = 0
                for el in elements:
                    try:
                        href = el.get_attribute("href")
                        if href and href.startswith("http") and href not in visited_urls:
                            if ".tr" in href or "github" in href or "stackoverflow" in href:
                                url_frontier.appendleft(href) 
                            else:
                                url_frontier.append(href)
                            links_found += 1
                            if links_found > 15: break 
                    except: pass
                
                with lock:
                    if dom_data:
                        for item in dom_data:
                            weight = 2 if (0.3 < item['y'] < 0.8) else 1
                            for _ in range(weight):
                                real_dom_buffer.append((item['f'], item['y']))
                                
                pages_visited += 1
                hunter_status = f"Bağlantılar Ayrıştırıldı (Bulunan: {links_found})"
                time.sleep(1)
                
            except Exception as e:
                hunter_status = f"Atlanıyor: {str(e).splitlines()[0][:40]}"
                time.sleep(1)
                
    except Exception as e:
        hunter_status = f"Bot Hatası: {str(e)}"
    finally:
        if driver:
            try: driver.quit()
            except: pass

t_hunter = threading.Thread(target=hunter_bot_worker)
t_hunter.daemon = True
t_hunter.start()

# ==============================================================================
# 5. ASENKRON KAYIT VE ONNX EXPORT
# ==============================================================================
drive_status = "BEKLENİYOR"

def save_pth(state_dict):
    global drive_status
    try:
        torch.save(state_dict, DRIVE_SAVE_PATH)
        drive_status = "KAYDEDİLDİ (.pth)"
    except Exception:
        drive_status = "KAYIT HATASI"

def save_onnx(model_copy):
    global export_status
    try:
        export_status = "ONNX ÇEVİRİLİYOR..."
        dummy_dom = torch.randn(1, DOM_INPUT_SIZE, device='cpu')
        torch.onnx.export(model_copy.cpu(), dummy_dom, ONNX_SEC_PATH, 
                          input_names=['dom_input'], output_names=['dom_output'])
        export_status = "ONNX HAZIR (.onnx)"
    except Exception as e:
        export_status = f"ONNX HATA: {e}"

def trigger_async_sync(model):
    state_copy = copy.deepcopy(model.state_dict())
    t_pth = threading.Thread(target=save_pth, args=(state_copy,))
    t_pth.daemon = True
    t_pth.start()

    # Senkron ONNX Export
    model_copy = copy.deepcopy(model)
    model_copy.eval()
    save_onnx(model_copy)


# ==============================================================================
# WGAN-GP: Gradient Penalty Fonksiyonu
# ==============================================================================
def compute_gradient_penalty(critic, real_samples, fake_samples):
    with torch.amp.autocast('cuda', enabled=False):
        real_samples = real_samples.float()
        fake_samples = fake_samples.float()
        alpha = torch.rand(real_samples.size(0), 1, device=device)
        interpolates = (alpha * real_samples + ((1 - alpha) * fake_samples)).requires_grad_(True)
        d_interpolates = critic(interpolates)
        fake = torch.ones(real_samples.size(0), 1, device=device)
        
        gradients = torch.autograd.grad(
            outputs=d_interpolates,
            inputs=interpolates,
            grad_outputs=fake,
            create_graph=True,
            retain_graph=True,
            only_inputs=True,
        )[0]
        
        gradients = gradients.view(gradients.size(0), -1)
        gradient_penalty = ((gradients.norm(2, dim=1) - 1) ** 2).mean()
        return gradient_penalty

# ==============================================================================
# 6. EĞİTİM MOTORU (WGAN-GP + LEAGUE TRAINING + CURRICULUM)
# ==============================================================================

def train_skynet():
    global export_status
    model = OmniversalSentinel().to(device)
    generator = HackerBotGenerator().to(device)
    
    # Tarihi Hacker Arşivi (League Training)
    hacker_archive = collections.deque(maxlen=10)
    hacker_distortion_scale = 0.25
    
    total_params = sum(p.numel() for p in model.parameters())
    gen_params = sum(p.numel() for p in generator.parameters())
            
    hacker_state_path = "/content/drive/MyDrive/uBlock_AI/hacker_bot.pth"
    if os.path.exists(hacker_state_path):
        try:
            hstate = torch.load(hacker_state_path, map_location=device)
            is_nan_h = any(torch.isnan(v).any() for v in hstate.values() if torch.is_tensor(v))
            if is_nan_h:
                print("⚠️ Kırmızı Takım (Hacker) modelinde NaN bulundu. Çökmüş model yok sayılıp sıfırdan başlanıyor.")
            else:
                generator.load_state_dict(hstate)
        except: pass
            
    if os.path.exists(DRIVE_SAVE_PATH):
        try:
            state = torch.load(DRIVE_SAVE_PATH, map_location=device)
            is_nan = any(torch.isnan(v).any() for v in state.values() if torch.is_tensor(v))
            if is_nan:
                print("⚠️ Önceki modelde NaN hatası bulundu. Çökmüş model yok sayılıp sıfırdan başlanıyor.")
            else:
                model.load_state_dict(state)
                print("✅ V8 AGI Kaldığı Yerden Devam Ediyor.")
        except: pass

    # WGAN-GP standart Optimizerları
    optimizer = optim.AdamW(model.parameters(), lr=2e-4, betas=(0.0, 0.9), weight_decay=1e-4)
    # Kırmızı Takım (Generator) öğrenme hızını düşürerek Mavi Takımın (Savunma) üstünlüğünü artırıyoruz
    optimizer_G = optim.AdamW(generator.parameters(), lr=5e-5, betas=(0.0, 0.9))
    
    scaler = torch.amp.GradScaler('cuda')
    scaler_G = torch.amp.GradScaler('cuda')
    
    best_acc = 0.0
    g_loss_val = 0.0
    
    def generate_vectorized_batch_gpu():
        half = BATCH_SIZE // 2
        
        X_dom = torch.rand(BATCH_SIZE, DOM_INPUT_SIZE, dtype=torch.float32, device=device) * 0.3
        y_dom = torch.zeros(BATCH_SIZE, 1, dtype=torch.float32, device=device)
        y_dom[half:] = 1.0 
        
        threat_idx = torch.arange(half, BATCH_SIZE, device=device)
        
        mask_av = torch.rand(half, device=device) < 0.6
        shift_idx = threat_idx[mask_av]
        X_dom[shift_idx, 10:80] += torch.rand(len(shift_idx), 70, device=device) * 0.6 + 0.3
        
        mask_ad = torch.rand(half, device=device) < 0.7
        ad_idx = threat_idx[mask_ad]
        X_dom[ad_idx, 180:240] = torch.clamp(X_dom[ad_idx, 180:240] + 0.5, 0.0, 1.0)
        
        mask_web = torch.rand(half, device=device) < 0.65
        web_idx = threat_idx[mask_web]
        X_dom[web_idx, 320:400] = torch.clamp(X_dom[web_idx, 320:400] - 0.2, 0.0, 1.0)
        X_dom[web_idx, 450:500] += 0.4
        
        clean_idx = torch.arange(0, half, device=device)
        fp_mask = torch.rand(half, device=device) < 0.25
        X_dom[clean_idx[fp_mask], 200:220] += 0.3 
        
        X_dom = torch.clamp(X_dom, 0.0, 1.0)
        
        with lock:
            buf_len = len(real_dom_buffer)
            if buf_len > 100:
                inject_count = min(BATCH_SIZE // 10, buf_len)
                real_samples = random.sample(real_dom_buffer, inject_count)
                real_X_tensor = torch.tensor([s[0] for s in real_samples], dtype=torch.float32, device=device)
                real_y_tensor = torch.tensor([[s[1]] for s in real_samples], dtype=torch.float32, device=device)
                
                X_dom[:inject_count] = real_X_tensor
                y_dom[:inject_count] = real_y_tensor

        return X_dom, y_dom

    iteration = 0
    start_time = time.time()
    last_ui_update = time.time()
    last_drive_sync = time.time()
    
    print(f"\n🚀 OMNIVERSAL MULTI-AGENT V8 AGI SİMÜLASYONU BAŞLIYOR!\n")
    time.sleep(1)
    
    while True:
        iteration += 1
        X_dom, y_true = generate_vectorized_batch_gpu()
        
        clean_mask = (y_true == 0).view(-1)
        threat_mask = (y_true == 1).view(-1)
        
        safe_real = X_dom[clean_mask]
        threat_real = X_dom[threat_mask]
        
        # League Training: Her 100 döngüde arşive kayıt
        if iteration % 100 == 0:
            hacker_archive.append(copy.deepcopy(generator.state_dict()))
        
        if len(safe_real) > 0:
            noise = torch.randn(len(safe_real), NOISE_DIM, device=device)
            
            # --- 1. MAVİ TAKIM (CRITIC / SENTINEL) EĞİTİMİ ---
            # %20 ihtimalle geçmişten gelen bir hacker (eski virüs) ile savaşır
            if len(hacker_archive) > 0 and random.random() < 0.2:
                old_gen = HackerBotGenerator().to(device)
                old_gen.load_state_dict(random.choice(hacker_archive))
                old_gen.eval()
                with torch.no_grad():
                    fake_malware_detached = old_gen(noise, safe_real, hacker_distortion_scale).detach()
            else:
                with torch.no_grad():
                    fake_malware_detached = generator(noise, safe_real, hacker_distortion_scale).detach()
            
            optimizer.zero_grad(set_to_none=True)
            with torch.amp.autocast('cuda'):
                # Modeli çalıştırıp skorları alıyoruz
                score_safe = model(safe_real)
                score_threat = model(threat_real) if len(threat_real) > 0 else torch.zeros_like(score_safe)
                score_fake = model(fake_malware_detached)
                
                # WGAN Loss (Minimize): Safe = Yüksek (negatif loss), Threat/Fake = Düşük (pozitif loss)
                if len(threat_real) > 0:
                    loss_D = torch.mean(score_fake) + torch.mean(score_threat) - 2.0 * torch.mean(score_safe)
                else:
                    loss_D = torch.mean(score_fake) - torch.mean(score_safe)
                
                # FP32 Dönüşümlü L2 Critic Drift Koruması: Skorların sonsuza gitmesini engeller
                loss_D = loss_D + 0.001 * (torch.mean(score_safe.float()**2) + torch.mean(score_threat.float()**2) + torch.mean(score_fake.float()**2))
                
            # WGAN-GP Penalty'i Mixed Precision (FP16) dışında FP32 olarak hesaplıyoruz
            min_len = min(len(safe_real), len(fake_malware_detached))
            if min_len > 0:
                gp = compute_gradient_penalty(model, safe_real[:min_len], fake_malware_detached[:min_len])
                loss_D = loss_D + 10.0 * gp
                
            scaler.scale(loss_D).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
            
            # --- 2. KIRMIZI TAKIM (GENERATOR) EĞİTİMİ ---
            # WGAN Standart (n_critic = 5): Mavi Takım 5 kez eğitilirken Kırmızı Takım 1 kez eğitilir
            if iteration % 5 == 0:
                optimizer_G.zero_grad(set_to_none=True)
                with torch.amp.autocast('cuda'):
                    fake_malware = generator(noise, safe_real, hacker_distortion_scale)
                    score_fake_G = model(fake_malware)
                    
                    # Hacker amacı: Mavi takıma bu virüsün SAFE (Yüksek Puan) olduğunu düşündürtmek
                    loss_G = -torch.mean(score_fake_G)
                    
                scaler_G.scale(loss_G).backward()
                scaler_G.step(optimizer_G)
                scaler_G.update()
                g_loss_val = loss_G.item()
        
        if iteration % 2000 == 0:
            with torch.no_grad():
                for name, module in model.named_modules():
                    if isinstance(module, nn.Linear):
                        prune.l1_unstructured(module, name='weight', amount=0.02)
                        prune.remove(module, 'weight')
        
        current_time = time.time()
        
        if current_time - last_drive_sync >= 60:
            last_drive_sync = current_time
            trigger_async_sync(model)
            
        if current_time - last_ui_update >= 2.0:
            last_ui_update = current_time
            
            with torch.no_grad():
                # 1. İsabet Ölçümü (Gerçek Temiz Siteler vs Gerçek Tehditler Eşiği)
                mean_safe = score_safe.mean().item()
                mean_fake = score_fake.mean().item()
                mean_threat = score_threat.mean().item() if len(threat_real) > 0 else mean_fake
                
                # Temiz (İyi) ve Kötü (Tehdit+Sahte) arasındaki karar çizgisi
                bad_mean = (mean_fake + mean_threat) / 2.0
                decision_threshold = (mean_safe + bad_mean) / 2.0
                
                acc_safe = (score_safe > decision_threshold).float().mean().item()
                acc_threat = (score_threat <= decision_threshold).float().mean().item() if len(threat_real) > 0 else 1.0
                acc_fake = (score_fake <= decision_threshold).float().mean().item()
                
                overall_acc = (acc_safe + acc_threat + acc_fake) / 3.0
                if overall_acc > best_acc:
                    best_acc = overall_acc
                    # Yeni Rekor İsabet! Otomatik En İyi Modeli Export Et
                    trigger_async_sync(model)

                # 2. Savunma Gücü / Kararlılığı (%) - WGAN Wasserstein Mesafesinin %'ye Kalibre Edilmesi
                wgan_distance = max(0.0, mean_safe - bad_mean)
                defense_power_pct = min(100.0, (1.0 - math.exp(-wgan_distance / 50.0)) * 100.0)

                # 3. Kırmızı Takım Sızma Başarısı (%)
                hacker_success_pct = (1.0 - acc_fake) * 100.0

                # Curriculum Learning: Zorluk Ayarlama
                if overall_acc > 0.90:
                    hacker_distortion_scale = min(0.65, hacker_distortion_scale + 0.005)
                elif overall_acc < 0.60:
                    hacker_distortion_scale = max(0.15, hacker_distortion_scale - 0.005)
            
            elapsed = int(current_time - start_time)
            time_str = f"{elapsed//3600:02d}:{(elapsed%3600)//60:02d}:{elapsed%60:02d}"
            
            clear_output(wait=True)
            print("=======================================================================")
            print(" 🌌 V8-NEXUS SKYNET [ALPHASTAR + WGAN-GP + CURRICULUM] 🌌")
            print("=======================================================================")
            print(f" ⚙️ Mavi Takım: {total_params:,} | Kırmızı Takım: {gen_params:,} (FP16)")
            print(f" ⏱️ Süre: {time_str} | Döngü: {iteration:,} | Batch: {BATCH_SIZE:,}")
            print("-----------------------------------------------------------------------")
            print(" 🛡️ [MAVİ TAKIM] OMNIVERSAL SENTINEL (Savunma Botu)")
            print(f"    └ Genel Savunma Başarısı:       %{overall_acc*100:.2f} (En İyi: %{best_acc*100:.2f})")
            print(f"    └ Temiz Siteleri Tanıma:         %{acc_safe*100:.2f}")
            print(f"    └ Gerçek Tehditleri Yakalama:    %{acc_threat*100:.2f}")
            print(f"    └ Sahte DOM Saldırısını Defetme: %{acc_fake*100:.2f}")
            print(f"    └ Savunma Kararlılığı & Gücü:   %{defense_power_pct:.2f}")
            print("-----------------------------------------------------------------------")
            print(" ⚔️ [KIRMIZI TAKIM] HACKER BOT (Saldırı Botu)")
            print(f"    └ Hacker Sızma Başarısı:        %{hacker_success_pct:.2f} (Savunmayı Yanıltma)")
            print(f"    └ Saldırı Bükme Zorluğu:        %{hacker_distortion_scale*100:.1f} (Curriculum)")
            print(f"    └ Lig Arşivi (Tarihi Klonlar):   {len(hacker_archive)} Eski Saldırı Stratejisi")
            print("-----------------------------------------------------------------------")
            print(" 🕸️ OTONOM İNTERNET GEZGİNİ (HUNTER ENGINE)")
            print(f"    └ Aktif URL:          {current_url[:60]}...")
            print(f"    └ Gezgin Durumu:      {hunter_status}")
            print(f"    └ Canlı Veri Havuzu:  {len(real_dom_buffer):,} Gerçek DOM Analiz Edildi")
            print("-----------------------------------------------------------------------")
            print(" 🌐 TARAYICI EXPORT & KAYIT STATUSÜ")
            print(f"    └ {export_status}")
            print("-----------------------------------------------------------------------")
            print(f" ☁️ Sistem Kayıt Durumu: {drive_status}")
            print("=======================================================================")

if __name__ == "__main__":
    train_skynet()
