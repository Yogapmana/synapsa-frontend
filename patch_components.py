import os

def patch_file(filepath, replacements, add_import=True):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    if add_import and "useTranslation" not in content:
        if "react-router-dom" in content:
            content = content.replace("import { Link", "import { useTranslation } from 'react-i18next';\nimport { Link")
        elif "lucide-react" in content:
            content = content.replace("import {", "import { useTranslation } from 'react-i18next';\nimport {", 1)
        elif "framer-motion" in content:
            content = content.replace("import { motion", "import { useTranslation } from 'react-i18next';\nimport { motion", 1)
        else:
            content = "import { useTranslation } from 'react-i18next';\n" + content

    for old, new in replacements:
        content = content.replace(old, new)
        
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")

patch_file('src/components/chat/ChatHistoryDrawer.jsx', [
    ('export default function ChatHistoryDrawer({ isOpen, onClose }) {', 'export default function ChatHistoryDrawer({ isOpen, onClose }) {\n  const { t } = useTranslation();'),
    ('Belum ada topik. Mulai sesi belajar untuk membuat kurikulum.', "{t('chat.no_topic', 'Belum ada topik. Mulai sesi belajar untuk membuat kurikulum.')}")
])

patch_file('src/components/curriculum/MindMapView.jsx', [
    ('export default function MindMapView({ topics = [], activeTopicId }) {', 'export default function MindMapView({ topics = [], activeTopicId }) {\n  const { t } = useTranslation();'),
    ("Kembali", "{t('curriculum.back', 'Kembali')}"),
    ("? 'Klik topik untuk mulai belajar.'", "? t('curriculum.click_to_start', 'Klik topik untuk mulai belajar.')"),
    ("? 'Klik topik untuk mulai belajar • Scroll untuk zoom • Drag untuk menggeser'", "? t('curriculum.click_instruction', 'Klik topik untuk mulai belajar • Scroll untuk zoom • Drag untuk menggeser')")
])

patch_file('src/components/curriculum/mindmap/MermaidMindmapView.jsx', [
    ('export default function MermaidMindmapView({ topics, activeTopicId }) {', 'export default function MermaidMindmapView({ topics, activeTopicId }) {\n  const { t } = useTranslation();'),
    ("Klik konsep untuk melihat detail • Klik topik untuk mulai belajar", "{t('curriculum.click_instruction', 'Klik konsep untuk melihat detail • Klik topik untuk mulai belajar')}")
])

patch_file('src/components/curriculum/mindmap/MarkmapMindmapView.jsx', [
    ('export default function MarkmapMindmapView({ topics, activeTopicId }) {', 'export default function MarkmapMindmapView({ topics, activeTopicId }) {\n  const { t } = useTranslation();'),
    ("Klik konsep untuk melihat detail • Klik topik untuk mulai belajar", "{t('curriculum.click_instruction', 'Klik konsep untuk melihat detail • Klik topik untuk mulai belajar')}")
])

patch_file('src/components/curriculum/mindmap/TopicNode.jsx', [
    ('export const TopicNode = ({ node }) => {', 'export const TopicNode = ({ node }) => {\n  const { t } = useTranslation();'),
    ("label: 'Mulai',", "label: t('curriculum.start', 'Mulai'),")
])

patch_file('src/components/module/StickyActionBar.jsx', [
    ('export default function StickyActionBar({ onContinue, completing, showFeedback }) {', 'export default function StickyActionBar({ onContinue, completing, showFeedback }) {\n  const { t } = useTranslation();'),
    ("{completing ? 'Memuat…' : 'Lanjut ke Kuis'}", "{completing ? t('module.loading', 'Memuat…') : t('module.continue_to_quiz', 'Lanjut ke Kuis')}")
])

patch_file('src/components/chat/FeaturedStarter.jsx', [
    ('export default function FeaturedStarter({ onSelect, isLoading }) {', 'export default function FeaturedStarter({ onSelect, isLoading }) {\n  const { t } = useTranslation();'),
    ("title: 'Mulai dari nol',", "title: t('chat.start_from_scratch', 'Mulai dari nol'),")
])

patch_file('src/components/quiz/QuizResult.jsx', [
    ('export default function QuizResult({ state, score, explanation, onContinue, onBackToMaterial }) {', 'export default function QuizResult({ state, score, explanation, onContinue, onBackToMaterial }) {\n  const { t } = useTranslation();'),
    ("Kembali ke Materi", "{t('quiz.back_to_material', 'Kembali ke Materi')}"),
    ("? 'Lanjut Topik Berikutnya'", "? t('quiz.next_topic', 'Lanjut Topik Berikutnya')"),
    (": 'Lulus Kuis (Min 60%) untuk Lanjut'", ": t('quiz.pass_to_continue', 'Lulus Kuis (Min 60%) untuk Lanjut')")
])

patch_file('src/components/common/ErrorBoundary.jsx', [
    ('class ErrorBoundary extends React.Component {', 'import { withTranslation } from "react-i18next";\nclass ErrorBoundary extends React.Component {'),
    ('Halaman ini gagal dimuat. Silakan coba lagi atau kembali ke dashboard.', "{this.props.t('common.error_loading', 'Halaman ini gagal dimuat. Silakan coba lagi atau kembali ke dashboard.')}"),
    ('Kembali ke Dashboard', "{this.props.t('common.back_to_dashboard', 'Kembali ke Dashboard')}"),
    ('export default ErrorBoundary;', 'export default withTranslation()(ErrorBoundary);')
], add_import=False)

patch_file('src/components/layout/Sidebar.jsx', [
    ('export default function Sidebar({ isOpen, onClose }) {', 'export default function Sidebar({ isOpen, onClose }) {\n  const { t } = useTranslation();'),
    ('aria-label="Keluar"', 'aria-label={t("common.logout", "Keluar")}'),
    ('span>Keluar</span>', 'span>{t("common.logout", "Keluar")}</span>')
])

print("Patching done!")
