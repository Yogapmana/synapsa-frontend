import json

ID_FILE = 'src/locales/id/translation.json'
EN_FILE = 'src/locales/en/translation.json'

id_additions = {
    "gamification": {
        "continue_learning": "Lanjutkan Belajar",
        "continue": "Lanjutkan!"
    },
    "chat": {
        "no_topic": "Belum ada topik. Mulai sesi belajar untuk membuat kurikulum.",
        "start_from_scratch": "Mulai dari nol"
    },
    "curriculum": {
        "back": "Kembali",
        "click_to_start": "Klik topik untuk mulai belajar.",
        "click_instruction": "Klik konsep untuk melihat detail • Klik topik untuk mulai belajar",
        "start": "Mulai"
    },
    "module": {
        "loading": "Memuat…",
        "continue_to_quiz": "Lanjut ke Kuis"
    },
    "quiz": {
        "back_to_material": "Kembali ke Materi",
        "next_topic": "Lanjut Topik Berikutnya",
        "pass_to_continue": "Lulus Kuis (Min 60%) untuk Lanjut",
        "excellent": "Sangat Baik",
        "good": "Baik",
        "fair": "Cukup",
        "needs_review": "Perlu Review"
    },
    "common": {
        "error_loading": "Halaman ini gagal dimuat. Silakan coba lagi atau kembali ke dashboard.",
        "back_to_dashboard": "Kembali ke Dashboard",
        "logout": "Keluar"
    }
}

en_additions = {
    "gamification": {
        "continue_learning": "Continue Learning",
        "continue": "Continue!"
    },
    "chat": {
        "no_topic": "No topics yet. Start a learning session to create a curriculum.",
        "start_from_scratch": "Start from scratch"
    },
    "curriculum": {
        "back": "Back",
        "click_to_start": "Click topic to start learning.",
        "click_instruction": "Click a concept to see details • Click a topic to start learning",
        "start": "Start"
    },
    "module": {
        "loading": "Loading…",
        "continue_to_quiz": "Continue to Quiz"
    },
    "quiz": {
        "back_to_material": "Back to Material",
        "next_topic": "Continue to Next Topic",
        "pass_to_continue": "Pass Quiz (Min 60%) to Continue",
        "excellent": "Excellent",
        "good": "Good",
        "fair": "Fair",
        "needs_review": "Needs Review"
    },
    "common": {
        "error_loading": "This page failed to load. Please try again or go back to dashboard.",
        "back_to_dashboard": "Back to Dashboard",
        "logout": "Log Out"
    }
}

def update_file(filepath, additions):
    with open(filepath, 'r') as f:
        data = json.load(f)
    for key, val in additions.items():
        if key in data and isinstance(data[key], dict) and isinstance(val, dict):
            data[key].update(val)
        else:
            data[key] = val
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

update_file(ID_FILE, id_additions)
update_file(EN_FILE, en_additions)
print("done")
