import json

ID_FILE = 'src/locales/id/translation.json'
EN_FILE = 'src/locales/en/translation.json'

id_additions = {
    "dashboard": {
        "stats_completed_topics": "Topik Selesai",
        "stats_from_total": "dari {{total}} total",
        "stats_study_time": "Waktu Belajar",
        "stats_this_week": "minggu ini",
        "stats_quiz_score": "Skor Kuis",
        "stats_quizzes_count": "{{count}} kuis",
        "activity_quiz": "Kuis: {{topic}}",
        "activity_score_time": "Skor: {{score}} — {{mins}} menit",
        "feedback_eval_title": "Evaluasi Adaptive Learning",
        "feedback_eval_msg": "Sistem mendeteksi tingkat pemahaman Anda.",
        "feedback_repeat_title": "Pemahaman Perlu Ditingkatkan",
        "feedback_repeat_msg": "Skor penguasaan Anda pada materi terakhir adalah {{score}}%. Sistem merekomendasikan Anda untuk mengulang materi yang disederhanakan. Silakan klik 'Lanjut Belajar' untuk memulai ulang.",
        "feedback_review_title": "Sesi Review Ditambahkan",
        "feedback_review_msg": "Skor penguasaan Anda pada materi terakhir adalah {{score}}%. Agar pemahaman lebih kuat, sebuah topik Review khusus telah disisipkan ke dalam jadwal Anda.",
        "feedback_accel_title": "Anda Sangat Cepat!",
        "feedback_accel_msg": "Skor penguasaan Anda adalah {{score}}%. Anda memahami materi dengan sangat baik! Jadwal telah dipercepat untuk menyesuaikan kemampuan Anda."
    },
    "curriculum": {
        "title": "Kurikulum",
        "empty_title": "Belum ada kurikulum",
        "empty_desc": "Mulai perjalanan belajarmu dengan membuat kurikulum baru melalui onboarding.",
        "start_onboarding": "Mulai Onboarding",
        "roadmap": "Roadmap",
        "mindmap": "Peta Konsep",
        "completed": "Selesai",
        "completed_topics": "Topik Selesai",
        "remaining_topics": "Topik Tersisa",
        "total_weeks": "Minggu Total",
        "passed": "Lulus",
        "progress": "Progres",
        "todays_focus": "Fokus Hari Ini",
        "minutes": "menit",
        "week_of_curriculum": "Minggu {{week}} dari kurikulum",
        "back_to_weeks": "Kembali ke Daftar Minggu",
        "week_title": "Minggu {{week}}: {{title}}",
        "select_module": "Pilih modul di bawah ini untuk mulai belajar.",
        "empty_weeks_title": "Kurikulum kosong",
        "empty_weeks_desc": "Kurikulum ini belum memiliki minggu/topik. Coba mulai ulang onboarding.",
        "start_learning": "Mulai Belajar"
    },
    "chat": {
        "title": "Tanya Synapsa Chatbot",
        "subtitle": "Asisten AI General • Jawaban komprehensif",
        "rag_active": "RAG & Web Search Aktif",
        "hide_history": "Sembunyikan riwayat",
        "show_history": "Tampilkan riwayat",
        "powered_by": "Didukung oleh RAG & Web Search",
        "thinking": "Memikirkan jawaban...",
        "invalid_session": "Sesi percakapan tidak valid. Silakan coba kirim ulang.",
        "send_failed": "Gagal mengirim pesan (Timeout/Error)",
        "upload_success": "Dokumen berhasil diunggah dan diindeks!",
        "upload_failed": "Gagal mengunggah dokumen",
        "new_chat": "Percakapan Baru",
        "chat_history": "Riwayat Obrolan",
        "input_placeholder": "Tanya apapun atau unggah dokumen...",
        "loading_history": "Memuat riwayat chat…",
        "new_document": "Dokumen Baru"
    }
}

en_additions = {
    "dashboard": {
        "stats_completed_topics": "Completed Topics",
        "stats_from_total": "of {{total}} total",
        "stats_study_time": "Study Time",
        "stats_this_week": "this week",
        "stats_quiz_score": "Quiz Score",
        "stats_quizzes_count": "{{count}} quizzes",
        "activity_quiz": "Quiz: {{topic}}",
        "activity_score_time": "Score: {{score}} — {{mins}} mins",
        "feedback_eval_title": "Adaptive Learning Evaluation",
        "feedback_eval_msg": "The system is detecting your comprehension level.",
        "feedback_repeat_title": "Improvement Needed",
        "feedback_repeat_msg": "Your mastery score on the last material was {{score}}%. The system recommends repeating a simplified version. Please click 'Continue Learning' to restart.",
        "feedback_review_title": "Review Session Added",
        "feedback_review_msg": "Your mastery score on the last material was {{score}}%. To strengthen your understanding, a special Review topic has been inserted into your schedule.",
        "feedback_accel_title": "You are Very Fast!",
        "feedback_accel_msg": "Your mastery score is {{score}}%. You understand the material very well! The schedule has been accelerated to match your abilities."
    },
    "curriculum": {
        "title": "Curriculum",
        "empty_title": "No curriculum yet",
        "empty_desc": "Start your learning journey by creating a new curriculum through onboarding.",
        "start_onboarding": "Start Onboarding",
        "roadmap": "Roadmap",
        "mindmap": "Concept Map",
        "completed": "Completed",
        "completed_topics": "Completed Topics",
        "remaining_topics": "Remaining Topics",
        "total_weeks": "Total Weeks",
        "passed": "Passed",
        "progress": "Progress",
        "todays_focus": "Today's Focus",
        "minutes": "mins",
        "week_of_curriculum": "Week {{week}} of curriculum",
        "back_to_weeks": "Back to Week List",
        "week_title": "Week {{week}}: {{title}}",
        "select_module": "Select a module below to start learning.",
        "empty_weeks_title": "Curriculum is empty",
        "empty_weeks_desc": "This curriculum does not have any weeks/topics yet. Try restarting onboarding.",
        "start_learning": "Start Learning"
    },
    "chat": {
        "title": "Ask Synapsa Chatbot",
        "subtitle": "General AI Assistant • Comprehensive answers",
        "rag_active": "RAG & Web Search Active",
        "hide_history": "Hide history",
        "show_history": "Show history",
        "powered_by": "Powered by RAG & Web Search",
        "thinking": "Thinking of an answer...",
        "invalid_session": "Invalid chat session. Please try sending again.",
        "send_failed": "Failed to send message (Timeout/Error)",
        "upload_success": "Document successfully uploaded and indexed!",
        "upload_failed": "Failed to upload document",
        "new_chat": "New Conversation",
        "chat_history": "Chat History",
        "input_placeholder": "Ask anything or upload a document...",
        "loading_history": "Loading chat history…",
        "new_document": "New Document"
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

print("Translations added successfully.")
