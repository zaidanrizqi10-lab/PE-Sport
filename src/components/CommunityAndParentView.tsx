import React, { useEffect, useState } from 'react';
import {
  Heart,
  MessageSquare,
  Pin,
  Send,
  Users,
} from 'lucide-react';
import { GrowthAnthropometryChart } from './Charts';
import {
  ForumCategory,
  ForumPost,
  ParentConsultationMessage,
  Role,
  Student,
} from '../types/fitness';
import { evaluateRecord, getLatestRecord } from '../utils/tkjiEngine';

interface CommunityAndParentViewProps {
  role: Role;
  students: Student[];
  activeStudent: Student;
  posts: ForumPost[];
  parentMessages: ParentConsultationMessage[];
  defaultSubTab?: 'forum' | 'parent';
  onAddPost: (post: ForumPost) => void;
  onToggleLikePost: (postId: string) => void;
  onTogglePinPost: (postId: string) => void;
  onAddReply: (postId: string, content: string) => void;
  onSendParentMessage: (msg: ParentConsultationMessage) => void;
}

const FORUM_CATEGORIES: ('Semua Topik' | ForumCategory)[] = [
  'Semua Topik',
  'Pengumuman Resmi',
  'Tips Latihan & Nutrisi',
  'Tantangan Mingguan',
  'Tanya Guru',
];

export const CommunityAndParentView: React.FC<CommunityAndParentViewProps> = ({
  role,
  students,
  activeStudent,
  posts,
  parentMessages,
  defaultSubTab,
  onAddPost,
  onToggleLikePost,
  onTogglePinPost,
  onAddReply,
  onSendParentMessage,
}) => {
  const [subTab, setSubTab] = useState<'forum' | 'parent'>(
    defaultSubTab || (role === 'orang_tua' ? 'parent' : 'forum')
  );

  useEffect(() => {
    if (defaultSubTab) {
      setSubTab(defaultSubTab);
    } else if (role === 'orang_tua') {
      setSubTab('parent');
    }
  }, [role, defaultSubTab]);

  // Forum State
  const [categoryFilter, setCategoryFilter] = useState<
    'Semua Topik' | ForumCategory
  >('Semua Topik');
  const [newPostCategory, setNewPostCategory] =
    useState<ForumCategory>('Tanya Guru');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  // Parent Consultation State
  const [consultStudentId, setConsultStudentId] = useState<string>(
    activeStudent.id
  );
  const [consultTopic, setConsultTopic] = useState<string>(
    'Kabar Nutrisi & Hidrasi Harian'
  );
  const [consultMessage, setConsultMessage] = useState<string>('');

  useEffect(() => {
    setConsultStudentId(activeStudent.id);
  }, [activeStudent.id]);

  const consultStudent =
    students.find((s) => s.id === consultStudentId) || activeStudent;
  const consultLatest = evaluateRecord(
    getLatestRecord(consultStudent),
    consultStudent.gender
  );

  const filteredPosts = [...posts]
    .filter((p) =>
      categoryFilter === 'Semua Topik' ? true : p.category === categoryFilter
    )
    .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  const getCurrentAuthorMeta = () => {
    if (role === 'guru') {
      return {
        name: 'Zaidan Rizqi, S.Pd.',
        context: 'Guru PJOK · SMP Global Mandiri Jakarta',
      };
    }
    if (role === 'orang_tua') {
      return {
        name: activeStudent.parentName,
        context: `${activeStudent.parentRelation} dari ${activeStudent.name} (${activeStudent.className})`,
      };
    }
    return {
      name: activeStudent.name,
      context: `Siswa Kelas ${activeStudent.className}`,
    };
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const author = getCurrentAuthorMeta();

    onAddPost({
      id: `post-${Date.now()}`,
      authorName: author.name,
      authorRole: role,
      authorContext: author.context,
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      createdAt: 'Baru saja',
      pinned: false,
      likes: 1,
      likedByMe: true,
      replies: [],
    });

    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleSendReply = (postId: string) => {
    const text = (replyDrafts[postId] || '').trim();
    if (!text) return;
    onAddReply(postId, text);
    setReplyDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  const studentMessages = parentMessages.filter(
    (m) => m.studentId === consultStudent.id
  );

  const handleSendConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultMessage.trim()) return;
    const isGuru = role === 'guru';

    onSendParentMessage({
      id: `msg-${Date.now()}`,
      studentId: consultStudent.id,
      senderRole: isGuru ? 'guru' : 'orang_tua',
      senderName: isGuru ? 'Zaidan Rizqi, S.Pd.' : consultStudent.parentName,
      topic: consultTopic,
      message: consultMessage.trim(),
      timestamp: 'Baru saja',
      nutritionTag: consultTopic,
    });
    setConsultMessage('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-emerald-700">
            Kolaborasi Siswa, Guru PJOK & Orang Tua / Wali Murid
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Forum Diskusi Kebugaran & Portal Orang Tua
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Ruang diskusi komunitas kelas 8-A & 8-B serta konsultasi dua arah tumbuh kembang dan nutrisi anak.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setSubTab('forum')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'forum'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Forum Diskusi Kelas</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('parent')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'parent'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Portal Orang Tua & Konsultasi</span>
          </button>
        </div>
      </div>

      {subTab === 'forum' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Category Filter + Discussion Threads */}
          <div className="lg:col-span-8 space-y-4">
            {/* Category Filter Bar */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
              {FORUM_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    categoryFilter === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className={`bg-white border rounded-xl p-5 space-y-3 ${
                  post.pinned ? 'border-emerald-600' : 'border-slate-200'
                }`}
              >
                {/* Clean unboxed metadata header */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="text-slate-500">
                    {post.pinned && (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 mr-2">
                        <Pin className="w-3.5 h-3.5" />
                        Disematkan ·
                      </span>
                    )}
                    <span className="font-semibold text-emerald-700">
                      {post.category}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-bold text-slate-900">
                      {post.authorName}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>{post.authorContext}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{post.createdAt}</span>
                  </div>

                  {role === 'guru' && (
                    <button
                      type="button"
                      onClick={() => onTogglePinPost(post.id)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                    >
                      {post.pinned ? 'Lepas Sematan' : 'Sematkan'}
                    </button>
                  )}
                </div>

                <h2 className="text-base font-bold text-slate-900">
                  {post.title}
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {post.content}
                </p>

                {/* Like & Reply Action Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={() => onToggleLikePost(post.id)}
                    className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
                      post.likedByMe
                        ? 'text-emerald-700'
                        : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.likedByMe ? 'fill-emerald-600 text-emerald-600' : ''
                      }`}
                    />
                    <span className="font-mono-tabular">
                      {post.likes} Apresiasi
                    </span>
                  </button>

                  <span className="text-slate-500 font-mono-tabular">
                    {post.replies.length} Balasan
                  </span>
                </div>

                {/* Nested Replies */}
                {post.replies.length > 0 && (
                  <div className="pl-4 border-l border-slate-200 space-y-2.5 pt-1">
                    {post.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="bg-slate-50 rounded-lg px-3.5 py-2.5 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            {rep.authorName}{' '}
                            <span className="font-normal text-emerald-700">
                              (
                              {rep.authorRole === 'guru'
                                ? 'Guru PJOK'
                                : rep.authorRole === 'orang_tua'
                                ? 'Orang Tua'
                                : 'Siswa'}
                              )
                            </span>
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {rep.createdAt}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {rep.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Reply Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={replyDrafts[post.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [post.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendReply(post.id);
                      }
                    }}
                    placeholder="Tulis balasan atau tanggapan..."
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendReply(post.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Balas
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Right 4 Cols: Create New Post Form */}
          <form
            onSubmit={handleCreatePost}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 lg:sticky lg:top-6"
          >
            <div>
              <p className="text-xs font-medium text-emerald-700">
                Mulai Topik Diskusi
              </p>
              <h3 className="text-base font-bold text-slate-900">
                Buat Postingan Baru
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Topik
              </label>
              <select
                value={newPostCategory}
                onChange={(e) =>
                  setNewPostCategory(e.target.value as ForumCategory)
                }
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Pengumuman Resmi">Pengumuman Resmi</option>
                <option value="Tips Latihan & Nutrisi">
                  Tips Latihan & Nutrisi
                </option>
                <option value="Tantangan Mingguan">Tantangan Mingguan</option>
                <option value="Tanya Guru">Tanya Guru</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Diskusi
              </label>
              <input
                type="text"
                required
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Tuliskan judul pertanyaan atau tips..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Isi Pesan
              </label>
              <textarea
                rows={4}
                required
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Bagikan pengalaman latihan, nutrisi, atau pertanyaan untuk Pak Zaidan..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Terbitkan ke Forum</span>
            </button>
          </form>
        </div>
      ) : (
        /* Portal Orang Tua & Konsultasi Dua Arah */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 6 Cols: Child Fitness & Growth Anthropometry */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-emerald-700">
                    Profil Kebugaran & Tumbuh Kembang Anak
                  </p>
                  <h2 className="text-lg font-bold text-slate-900">
                    {consultStudent.name} · Kelas {consultStudent.className}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Wali Murid: {consultStudent.parentName} ({consultStudent.parentRelation})
                  </p>
                </div>

                {role === 'guru' && (
                  <select
                    aria-label="Pilih Siswa untuk Konsultasi Wali"
                    value={consultStudent.id}
                    onChange={(e) => setConsultStudentId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.className}) — {s.parentName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block">Skor TKJI</span>
                  <strong className="font-mono-tabular text-base text-slate-900">
                    {consultLatest.totalScore}/25
                  </strong>
                  <span className="block text-emerald-700 font-semibold">
                    {consultLatest.predicate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">VO2Max Cooper</span>
                  <strong className="font-mono-tabular text-base text-slate-900">
                    {consultLatest.vo2Max}
                  </strong>
                  <span className="block text-slate-600">
                    {consultLatest.vo2Category}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status BMI</span>
                  <strong className="font-mono-tabular text-base text-slate-900">
                    {consultLatest.bmi}
                  </strong>
                  <span className="block text-emerald-700 font-semibold">
                    {consultLatest.bmiCategory}
                  </span>
                </div>
              </div>
            </div>

            <GrowthAnthropometryChart student={consultStudent} />
          </div>

          {/* Right 6 Cols: Konsultasi Dua Arah Orang Tua <-> Guru PJOK */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <p className="text-xs font-medium text-emerald-700">
                Komunikasi Langsung Wali Murid & Guru PJOK
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                Konsultasi Dua Arah & Kabar Nutrisi Anak
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Orang tua dapat melaporkan asupan nutrisi harian, jam istirahat, atau kondisi kebugaran anak kepada Pak Zaidan Rizqi, S.Pd.
              </p>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {studentMessages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  Belum ada riwayat konsultasi untuk {consultStudent.name}. Mulai kirim kabar nutrisi atau pertanyaan di bawah ini.
                </div>
              ) : (
                studentMessages.map((msg) => {
                  const isGuru = msg.senderRole === 'guru';
                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                        isGuru
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          {msg.senderName}{' '}
                          <span className="font-normal text-emerald-700">
                            ({isGuru ? 'Guru PJOK' : 'Orang Tua / Wali'})
                          </span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono-tabular">
                          {msg.timestamp}
                        </span>
                      </div>
                      <div className="font-semibold text-emerald-800">
                        Topik: {msg.topic}
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        {msg.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <form
              onSubmit={handleSendConsult}
              className="pt-3 border-t border-slate-100 space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topik Konsultasi / Kabar Nutrisi
                </label>
                <select
                  value={consultTopic}
                  onChange={(e) => setConsultTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Kabar Nutrisi & Hidrasi Harian">
                    Kabar Nutrisi & Hidrasi Harian
                  </option>
                  <option value="Jadwal Tidur & Pemulihan Fisik">
                    Jadwal Tidur & Pemulihan Fisik
                  </option>
                  <option value="Program Latihan Mandiri di Rumah">
                    Program Latihan Mandiri di Rumah
                  </option>
                  <option value="Catatan Kondisi Kesehatan / Cedera Ringan">
                    Catatan Kondisi Kesehatan / Cedera Ringan
                  </option>
                </select>
              </div>

              <div>
                <textarea
                  rows={3}
                  required
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  placeholder={
                    role === 'guru'
                      ? `Tulis balasan pembinaan untuk ${consultStudent.parentName}...`
                      : `Kirim kabar nutrisi atau pertanyaan ke Pak Zaidan mengenai ${consultStudent.name}...`
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {role === 'guru'
                      ? 'Kirim Balasan Guru'
                      : 'Kirim Kabar ke Guru PJOK'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
