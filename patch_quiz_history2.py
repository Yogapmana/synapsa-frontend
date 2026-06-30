import json

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

content = content.replace("Kembali ke Riwayat Kuis", "{t('quiz.back_to_history', 'Kembali ke Riwayat Kuis')}")
content = content.replace("Riwayat kuis per topik — {attempts.length} percobaan.", "{t('quiz.attempts_count', { count: attempts.length, defaultValue: `Riwayat kuis per topik — ${attempts.length} percobaan.` })}")
content = content.replace("Coba Lagi<", "{t('quiz.try_again', 'Coba Lagi')}<")
content = content.replace("Klik t('quiz.try_again', 'Coba Lagi')", "Klik 'Coba Lagi'")
content = content.replace("Klik 'Coba Lagi' untuk mengerjakan kuis topik ini.", "{t('quiz.no_attempts_desc', \"Klik 'Coba Lagi' untuk mengerjakan kuis topik ini.\")}")
content = content.replace('title="Belum ada percobaan kuis"', 'title={t("quiz.no_attempts", "Belum ada percobaan kuis")}')
content = content.replace('actionLabel="Mulai Kuis"', 'actionLabel={t("quiz.start_quiz", "Mulai Kuis")}')

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
content = content.replace(">Review -><", ">{t('quiz.review_btn', 'Review >')}<")
content = content.replace("Review &gt;", "{t('quiz.review_btn', 'Review >')}")

content = content.replace("function ReviewModal({ attempt, onClose, topicTitle }) {", "function ReviewModal({ attempt, onClose, topicTitle }) {\n  const { t } = useTranslation();")
content = content.replace("function ReviewModal({ attempt, attemptNumber, topicTitle, onClose }) {", "function ReviewModal({ attempt, attemptNumber, topicTitle, onClose }) {\n  const { t } = useTranslation();")

content = content.replace("getScorePill(score)", "getScorePill(score, t)")
content = content.replace(">Review Jawaban<", ">{t('quiz.review_answers', 'Review Jawaban')}<")
content = content.replace("Percobaan #{attemptNumber}", "{t('quiz.attempt_title', { num: attemptNumber, defaultValue: `Percobaan #${attemptNumber}` })}")
content = content.replace("{correctAnswers}/{totalQuestions} benar", "{t('quiz.correct_count', { correct: correctAnswers, total: totalQuestions, defaultValue: `${correctAnswers}/${totalQuestions} benar` })}")

content = content.replace("function ReviewErrorState({ error, topicId }) {", "function ReviewErrorState({ error, topicId }) {\n  const { t } = useTranslation();")
content = content.replace(">Gagal memuat detail<", ">{t('quiz.failed_load_detail', 'Gagal memuat detail')}<")
content = content.replace(">Tidak dapat mengambil detail percobaan ini dari server.\n        Coba tutup dan buka kembali modal Review.<", ">{t('quiz.failed_load_detail_desc', 'Tidak dapat mengambil detail percobaan ini dari server. Coba tutup dan buka kembali modal Review.')}<")
content = content.replace("Coba Lagi untuk Rekam Ulang", "{t('quiz.try_again_record', 'Coba Lagi untuk Rekam Ulang')}")

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
# Handle the whitespace issue for JSX correctly:
content = content.replace(
    '<span className="text-secondary text-xs font-label">Jawaban\nAnda: </span>',
    '<span className="text-secondary text-xs font-label">{t("quiz.your_answer", "Jawaban Anda: ")}</span>'
)
content = content.replace(
    '<span className="text-secondary text-xs font-label">Jawaba\nn benar: </span>',
    '<span className="text-secondary text-xs font-label">{t("quiz.correct_answer", "Jawaban benar: ")}</span>'
)
content = content.replace("'— tidak dijawab —'", "t('quiz.unanswered', '— tidak dijawab —')")

with open(filepath, 'w') as f:
    f.write(content)
print("Updated QuizHistoryByTopic.jsx")
