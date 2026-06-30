import json

ID_FILE = 'src/locales/id/translation.json'
EN_FILE = 'src/locales/en/translation.json'

id_additions = {
    "settings": {
        "title": "Pengaturan",
        "desc": "Kelola profil, preferensi belajar, tampilan, dan data progresmu.",
        "section": "Bagian",
        "profile": "Profil",
        "learning": "Belajar",
        "notifications": "Notifikasi",
        "data": "Data",
        "account": "Akun",
        "preferences": "Preferensi",
        "communication": "Komunikasi",
        "profile_desc": "Informasi akun yang terhubung dengan Synapsa.",
        "profile_edit_soon": "Edit profil akan segera tersedia",
        "username": "Username",
        "email": "Email",
        "learning_desc": "Ringkasan sesi belajar aktif dan preferensi belajarmu.",
        "topic": "Topik",
        "duration": "Durasi",
        "level": "Level",
        "weeks": "{{count}} minggu",
        "reset_session": "Reset sesi belajar",
        "reset_session_title": "Reset sesi belajar?",
        "reset_session_desc_active": "Tindakan ini akan menghapus sesi aktif dan progres terkait sesi tersebut.",
        "reset_session_desc_empty": "Belum ada sesi aktif untuk di-reset.",
        "cancel": "Batal",
        "reset": "Reset",
        "resetting": "Mereset...",
        "notifications_desc": "Atur bagaimana Synapsa menghubungimu.",
        "email_notif": "Email notifikasi",
        "email_notif_desc": "Terima update progres via email",
        "push_notif": "Push notifikasi",
        "push_notif_desc": "Terima notifikasi di browser",
        "data_desc": "Ekspor progresmu atau kelola akun.",
        "danger_zone": "Zona Berbahaya",
        "delete_account": "Hapus Akun",
        "delete_account_title": "Hapus akun?",
        "delete_account_desc": "Fitur ini belum tersedia. Coming soon.",
        "coming_soon": "Coming Soon",
        "exporting": "Mengekspor...",
        "saved": "Tersimpan!",
        "export_progress": "Export Progress",
        "export_desc": "Mengunduh seluruh data sesi, topik, dan riwayat kuis dalam format JSON."
    },
    "quiz": {
        "excellent": "Sangat Baik",
        "good": "Baik",
        "fair": "Cukup",
        "needs_review": "Perlu Review",
        "improving": "Membaik",
        "declining": "Menurun",
        "stable": "Stabil",
        "untitled_topic": "Topik tanpa judul",
        "less_than_1m": "< 1 mnt",
        "mins_format": "{{mins}} mnt",
        "history_title": "Riwayat Kuis",
        "history_desc": "Semua kuis yang pernah Anda kerjakan, dikelompokkan per topik.",
        "total_quizzes": "Total Kuis",
        "average": "Rata-rata",
        "best_score": "Skor Terbaik",
        "topics_attempted": "Topik Dikerjakan",
        "no_history_title": "Belum ada riwayat kuis",
        "no_history_desc": "Mulai kerjakan kuis pada topik manapun untuk melihat riwayatnya di sini.",
        "attempts": "percobaan",
        "best_prefix": "Terbaik:",
        "view_details": "Lihat detail"
    }
}

en_additions = {
    "settings": {
        "title": "Settings",
        "desc": "Manage your profile, learning preferences, appearance, and progress data.",
        "section": "Section",
        "profile": "Profile",
        "learning": "Learning",
        "notifications": "Notifications",
        "data": "Data",
        "account": "Account",
        "preferences": "Preferences",
        "communication": "Communication",
        "profile_desc": "Account information connected with Synapsa.",
        "profile_edit_soon": "Profile editing will be available soon",
        "username": "Username",
        "email": "Email",
        "learning_desc": "Summary of active learning sessions and your learning preferences.",
        "topic": "Topic",
        "duration": "Duration",
        "level": "Level",
        "weeks": "{{count}} weeks",
        "reset_session": "Reset learning session",
        "reset_session_title": "Reset learning session?",
        "reset_session_desc_active": "This action will delete the active session and progress related to this session.",
        "reset_session_desc_empty": "No active session to reset.",
        "cancel": "Cancel",
        "reset": "Reset",
        "resetting": "Resetting...",
        "notifications_desc": "Manage how Synapsa contacts you.",
        "email_notif": "Email notifications",
        "email_notif_desc": "Receive progress updates via email",
        "push_notif": "Push notifications",
        "push_notif_desc": "Receive notifications in browser",
        "data_desc": "Export your progress or manage your account.",
        "danger_zone": "Danger Zone",
        "delete_account": "Delete Account",
        "delete_account_title": "Delete account?",
        "delete_account_desc": "This feature is not yet available. Coming soon.",
        "coming_soon": "Coming Soon",
        "exporting": "Exporting...",
        "saved": "Saved!",
        "export_progress": "Export Progress",
        "export_desc": "Download all session, topic, and quiz history data in JSON format."
    },
    "quiz": {
        "excellent": "Excellent",
        "good": "Good",
        "fair": "Fair",
        "needs_review": "Needs Review",
        "improving": "Improving",
        "declining": "Declining",
        "stable": "Stable",
        "untitled_topic": "Untitled topic",
        "less_than_1m": "< 1 min",
        "mins_format": "{{mins}} mins",
        "history_title": "Quiz History",
        "history_desc": "All quizzes you have ever taken, grouped by topic.",
        "total_quizzes": "Total Quizzes",
        "average": "Average",
        "best_score": "Best Score",
        "topics_attempted": "Topics Attempted",
        "no_history_title": "No quiz history yet",
        "no_history_desc": "Start taking quizzes on any topic to see the history here.",
        "attempts": "attempts",
        "best_prefix": "Best:",
        "view_details": "View details"
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
