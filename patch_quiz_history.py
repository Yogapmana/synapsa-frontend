import os
import json

ID_FILE = 'src/locales/id/translation.json'
EN_FILE = 'src/locales/en/translation.json'

id_additions = {
    "quiz": {
        "back_to_history": "Kembali ke Riwayat Kuis",
        "attempts_count": "Riwayat kuis per topik — {{count}} percobaan.",
        "try_again": "Coba Lagi",
        "best_score": "SKOR TERBAIK",
        "latest_score": "SKOR TERBARU",
        "total_attempts": "TOTAL PERCOBAAN",
        "stable": "STABIL",
        "attempt_history": "Riwayat Percobaan",
        "entries_count": "{{count}} entri",
        "attempt_num": "COBA\n{{num}}",
        "score_percent": "Skor {{score}}%",
        "latest": "TERBARU",
        "correct_count": "{{correct}}/{{total}} benar",
        "mins_short": "{{duration}} mnt",
        "review_btn": "Review >",
        "review_answers": "Review Jawaban",
        "attempt_title": "Percobaan #{{num}}",
        "failed_load_detail": "Gagal memuat detail",
        "failed_load_detail_desc": "Tidak dapat mengambil detail percobaan ini dari server. Coba tutup dan buka kembali modal Review.",
        "try_again_record": "Coba Lagi untuk Rekam Ulang",
        "no_detail": "Detail jawaban tidak tersedia",
        "no_detail_desc": "Detail per-soal untuk percobaan ini belum terekam. Skor keseluruhan ({{correct}}/{{total}}) tetap tersimpan.",
        "question_num": "Pertanyaan {{num}}",
        "correct": "Benar",
        "incorrect": "Salah",
        "your_answer": "Jawaban Anda: ",
        "correct_answer": "Jawaban benar: ",
        "unanswered": "— tidak dijawab —",
        "no_detail_zero": "Kuis ini tidak punya detail jawaban",
        "no_detail_zero_desc": "Percobaan ini terekam dengan 0 pertanyaan. Kemungkinan sistem gagal membuat soal kuis saat percobaan ini. Detail per-soal tidak bisa ditampilkan karena tidak ada soal yang dinilai."
    }
}

en_additions = {
    "quiz": {
        "back_to_history": "Back to Quiz History",
        "attempts_count": "Quiz history per topic — {{count}} attempts.",
        "try_again": "Try Again",
        "best_score": "BEST SCORE",
        "latest_score": "LATEST SCORE",
        "total_attempts": "TOTAL ATTEMPTS",
        "stable": "STABLE",
        "attempt_history": "Attempt History",
        "entries_count": "{{count}} entries",
        "attempt_num": "TRY\n{{num}}",
        "score_percent": "Score {{score}}%",
        "latest": "LATEST",
        "correct_count": "{{correct}}/{{total}} correct",
        "mins_short": "{{duration}} mins",
        "review_btn": "Review >",
        "review_answers": "Review Answers",
        "attempt_title": "Attempt #{{num}}",
        "failed_load_detail": "Failed to load details",
        "failed_load_detail_desc": "Unable to fetch attempt details from the server. Try closing and reopening the Review modal.",
        "try_again_record": "Try Again to Record",
        "no_detail": "Answer details unavailable",
        "no_detail_desc": "Question details for this attempt have not been recorded. The overall score ({{correct}}/{{total}}) is saved.",
        "question_num": "Question {{num}}",
        "correct": "Correct",
        "incorrect": "Incorrect",
        "your_answer": "Your answer: ",
        "correct_answer": "Correct answer: ",
        "unanswered": "— unanswered —",
        "no_detail_zero": "This quiz has no answer details",
        "no_detail_zero_desc": "This attempt was recorded with 0 questions. It's likely the system failed to generate quiz questions during this attempt. Per-question details cannot be displayed."
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
print("Updated JSON files")

filepath = 'src/pages/QuizHistoryByTopic.jsx'
with open(filepath, 'r') as f:
    content = f.read()

import_str = "import { useTranslation } from 'react-i18next'\n"
if import_str not in content:
    content = content.replace("import { motion, AnimatePresence } from 'framer-motion'", import_str + "import { motion, AnimatePresence } from 'framer-motion'")

content = content.replace(
    'function getScorePill(percentage) {',
    'function getScorePill(percentage, t) {\n  if (!t) return { variant: "neutral", label: "—" }'
)
content = content.replace(
    "if (percentage >= 90) return { variant: 'success', label: 'Sangat Baik' }",
    "if (percentage >= 90) return { variant: 'success', label: t('quiz.excellent', 'Sangat Baik') }"
)
content = content.replace(
    "if (percentage >= 75) return { variant: 'info', label: 'Baik' }",
    "if (percentage >= 75) return { variant: 'info', label: t('quiz.good', 'Baik') }"
)
content = content.replace(
    "if (percentage >= 60) return { variant: 'warning', label: 'Cukup' }",
    "if (percentage >= 60) return { variant: 'warning', label: t('quiz.fair', 'Cukup') }"
)
content = content.replace(
    "return { variant: 'danger', label: 'Perlu Review' }",
    "return { variant: 'danger', label: t('quiz.needs_review', 'Perlu Review') }"
)

content = content.replace("export default function QuizHistoryByTopic() {", "export default function QuizHistoryByTopic() {\n  const { t } = useTranslation()")

content = content.replace("'Kembali ke Riwayat Kuis'", "t('quiz.back_to_history', 'Kembali ke Riwayat Kuis')")
content = content.replace("Riwayat kuis per topik — {attempts.length} percobaan.", "{t('quiz.attempts_count', { count: attempts.length, defaultValue: `Riwayat kuis per topik — ${attempts.length} percobaan.` })}")
content = content.replace("'Coba Lagi'", "t('quiz.try_again', 'Coba Lagi')")

content = content.replace(">SKOR TERBAIK<", ">{t('quiz.best_score', 'SKOR TERBAIK')}<")
content = content.replace(">SKOR TERBARU<", ">{t('quiz.latest_score', 'SKOR TERBARU')}<")
content = content.replace(">TOTAL PERCOBAAN<", ">{t('quiz.total_attempts', 'TOTAL PERCOBAAN')}<")
content = content.replace(">STABIL<", ">{t('quiz.stable', 'STABIL')}<")
content = content.replace(">Riwayat Percobaan<", ">{t('quiz.attempt_history', 'Riwayat Percobaan')}<")
content = content.replace("{attempts.length} entri", "{t('quiz.entries_count', { count: attempts.length, defaultValue: `${attempts.length} entri` })}")

content = content.replace("function AttemptRow({ attempt, index, total, onReview }) {", "function AttemptRow({ attempt, index, total, onReview }) {\n  const { t } = useTranslation();")
content = content.replace("getScorePill(attempt.percentage)", "getScorePill(attempt.percentage, t)")
content = content.replace("COBA\\n{index + 1}", "{t('quiz.attempt_num', { num: index + 1, defaultValue: `COBA\\n${index + 1}` })}")
content = content.replace("Skor {score}%", "{t('quiz.score_percent', { score, defaultValue: `Skor ${score}%` })}")
content = content.replace(">TERBARU<", ">{t('quiz.latest', 'TERBARU')}<")
content = content.replace("{attempt.correct_answers}/{attempt.total_questions} benar", "{t('quiz.correct_count', { correct: attempt.correct_answers, total: attempt.total_questions, defaultValue: `${attempt.correct_answers}/${attempt.total_questions} benar` })}")
content = content.replace("{time} mnt", "{t('quiz.mins_short', { duration: time, defaultValue: `${time} mnt` })}")
content = content.replace("'Review >'", "t('quiz.review_btn', 'Review >')")

content = content.replace("function ReviewModal({ attempt, onClose, topicTitle }) {", "function ReviewModal({ attempt, onClose, topicTitle }) {\n  const { t } = useTranslation();")
content = content.replace("getScorePill(score)", "getScorePill(score, t)")
content = content.replace(">Review Jawaban<", ">{t('quiz.review_answers', 'Review Jawaban')}<")
content = content.replace("Percobaan #{attemptNumber}", "{t('quiz.attempt_title', { num: attemptNumber, defaultValue: `Percobaan #${attemptNumber}` })}")
content = content.replace("{correctAnswers}/{totalQuestions} benar", "{t('quiz.correct_count', { correct: correctAnswers, total: totalQuestions, defaultValue: `${correctAnswers}/${totalQuestions} benar` })}")

content = content.replace("function ReviewErrorState({ error, topicId }) {", "function ReviewErrorState({ error, topicId }) {\n  const { t } = useTranslation();")
content = content.replace(">Gagal memuat detail<", ">{t('quiz.failed_load_detail', 'Gagal memuat detail')}<")
content = content.replace(">Tidak dapat mengambil detail percobaan ini dari server. Coba tutup dan buka kembali modal Review.<", ">{t('quiz.failed_load_detail_desc', 'Tidak dapat mengambil detail percobaan ini dari server. Coba tutup dan buka kembali modal Review.')}<")
content = content.replace(">Coba Lagi untuk Rekam Ulang<", ">{t('quiz.try_again_record', 'Coba Lagi untuk Rekam Ulang')}<")

content = content.replace("function EmptyReviewState({ attempt, topicId }) {", "function EmptyReviewState({ attempt, topicId }) {\n  const { t } = useTranslation();")
content = content.replace("'Kuis ini tidak punya detail jawaban'", "t('quiz.no_detail_zero', 'Kuis ini tidak punya detail jawaban')")
content = content.replace("'Detail jawaban tidak tersedia'", "t('quiz.no_detail', 'Detail jawaban tidak tersedia')")
content = content.replace(
    "Percobaan ini terekam dengan{' '}",
    "{t('quiz.no_detail_zero_desc', \"Percobaan ini terekam dengan 0 pertanyaan. Kemungkinan sistem gagal membuat soal kuis saat percobaan ini. Detail per-soal tidak bisa ditampilkan karena tidak ada soal yang dinilai.\")}{' '}"
)
content = content.replace(
    "<span className=\"font-semibold text-primary\">\n              0 pertanyaan\n            </span>{' '}\n            ({correct}/{total} benar). Kemungkinan sistem gagal membuat\n            soal kuis saat percobaan ini (mis. cache kadaluwarsa atau\n            generator LLM tidak mengembalikan format yang valid). Detail\n            per-soal tidak bisa ditampilkan karena tidak ada soal yang\n            dinilai.",
    ""
)
content = content.replace(
    "Detail per-soal untuk percobaan ini belum terekam.\n            Skor keseluruhan ({correct}/{total}) tetap tersimpan.",
    "{t('quiz.no_detail_desc', { correct, total, defaultValue: `Detail per-soal untuk percobaan ini belum terekam. Skor keseluruhan (${correct}/${total}) tetap tersimpan.` })}"
)

content = content.replace("Pertanyaan {a.question_index + 1}", "{t('quiz.question_num', { num: a.question_index + 1, defaultValue: `Pertanyaan ${a.question_index + 1}` })}")
content = content.replace("'Benar' : 'Salah'", "t('quiz.correct', 'Benar') : t('quiz.incorrect', 'Salah')")
content = content.replace("Jawaban Anda: ", "{t('quiz.your_answer', 'Jawaban Anda: ')}")
content = content.replace("Jawaban benar: ", "{t('quiz.correct_answer', 'Jawaban benar: ')}")
content = content.replace("'— tidak dijawab —'", "t('quiz.unanswered', '— tidak dijawab —')")
# Handle the whitespace issue for JSX correctly:
content = content.replace(
    '<span className="text-secondary text-xs font-label">Jawaban\nAnda: </span>',
    '<span className="text-secondary text-xs font-label">{t("quiz.your_answer", "Jawaban Anda: ")}</span>'
)
content = content.replace(
    '<span className="text-secondary text-xs font-label">Jawaba\nn benar: </span>',
    '<span className="text-secondary text-xs font-label">{t("quiz.correct_answer", "Jawaban benar: ")}</span>'
)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated QuizHistoryByTopic.jsx")
