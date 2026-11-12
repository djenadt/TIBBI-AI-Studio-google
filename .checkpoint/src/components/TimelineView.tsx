import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Pill,
  FlaskConical,
  Stethoscope,
  Scissors,
  Baby,
  Activity,
  Plus,
  Filter,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { TimelineCategory, TimelineEvent } from '../types/tibbi';

export const TimelineView: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberTimeline,
    addTimelineEvent,
  } = useTibbi();

  const isAr = language === 'ar';

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    category: 'consultation' as TimelineCategory,
    date: new Date().toISOString().split('T')[0],
    description: '',
    doctorOrFacility: '',
    badge: '',
  });

  const filteredEvents = activeMemberTimeline.filter((ev) => {
    if (categoryFilter === 'all') return true;
    return ev.category === categoryFilter;
  });

  const getCategoryIcon = (category: TimelineCategory) => {
    switch (category) {
      case 'prescription':
        return <Pill className="w-4 h-4 text-amber-600" />;
      case 'lab':
        return <FlaskConical className="w-4 h-4 text-blue-600" />;
      case 'consultation':
        return <Stethoscope className="w-4 h-4 text-teal-600" />;
      case 'surgery':
        return <Scissors className="w-4 h-4 text-rose-600" />;
      case 'vaccine':
        return <Baby className="w-4 h-4 text-emerald-600" />;
      case 'vital':
        return <Activity className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    addTimelineEvent({
      patientId: activeMember.id,
      title: form.title,
      category: form.category,
      date: form.date,
      description: form.description,
      doctorOrFacility: form.doctorOrFacility,
      badge: form.badge || (isAr ? 'حدث صحي' : 'Événement'),
    });

    setIsAddModalOpen(false);
    setForm({
      title: '',
      category: 'consultation',
      date: new Date().toISOString().split('T')[0],
      description: '',
      doctorOrFacility: '',
      badge: '',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>{isAr ? 'الخط الزمني لحياتك الصحية' : 'Chronologie & Ligne de Vie Médicale'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `التسلسل الزمني المتكامل لأحداث وتاريخ المريض: ${activeMember.fullNameAr} - من الطفولة وحتى اليوم.`
              : `Fil conducteur chronologique complet de ${activeMember.fullNameFr} - Consultations, bilans et antécédents.`}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? '+ تسجيل حدث تاريخي' : '+ Ajouter un jalon'}</span>
        </button>
      </div>

      {/* Filter Categories */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', labelAr: 'جميع الأحداث', labelFr: 'Tous' },
            { id: 'consultation', labelAr: 'استشارات وزيارات', labelFr: 'Consultations' },
            { id: 'prescription', labelAr: 'أدوية ووصفات', labelFr: 'Médicaments' },
            { id: 'lab', labelAr: 'تحاليل مخبرية', labelFr: 'Analyses' },
            { id: 'radiology', labelAr: 'أشعة وفحوصات', labelFr: 'Imagerie' },
            { id: 'vaccine', labelAr: 'تطعيمات', labelFr: 'Vaccins' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelFr}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {filteredEvents.length} {isAr ? 'أحداث' : 'événements'}
        </span>
      </div>

      {/* Vertical Interactive Timeline */}
      <div className="relative border-r-2 border-teal-200 dark:border-teal-900/60 mr-4 sm:mr-6 pr-6 space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -right-[33px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-teal-600 dark:border-teal-400 shadow-sm flex items-center justify-center group-hover:scale-125 transition-transform" />

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-400 dark:hover:border-teal-500 transition-all space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getCategoryIcon(event.category)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                      {event.title}
                    </h4>
                    {event.badge && (
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-100 dark:border-teal-800/60 mt-0.5">
                        {event.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                {event.description}
              </p>

              {event.doctorOrFacility && (
                <div className="text-[11px] text-teal-800 dark:text-teal-300 font-semibold pt-1">
                  🏥 {event.doctorOrFacility}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{isAr ? 'تسجيل حدث صحي في الخط الزمني' : 'Ajouter un jalon médical'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'عنوان الحدث الصحي *' : 'Titre de l’événement *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: إجراء عملية الزائدة الدودية، تشخيص حساسية..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'التصنيف' : 'Catégorie'}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TimelineCategory })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="consultation">{isAr ? 'استشارة طبية' : 'Consultation'}</option>
                    <option value="prescription">{isAr ? 'وصفة علاجية' : 'Ordonnance'}</option>
                    <option value="lab">{isAr ? 'تحليل مخبري' : 'Analyse'}</option>
                    <option value="radiology">{isAr ? 'أشعة وتصوير' : 'Radiologie'}</option>
                    <option value="surgery">{isAr ? 'عملية جراحية' : 'Chirurgie'}</option>
                    <option value="vaccine">{isAr ? 'تطعيم / لقاح' : 'Vaccination'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'التاريخ *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'الطبيب أو المؤسسة الصحية' : 'Médecin ou Clinique'}
                </label>
                <input
                  type="text"
                  value={form.doctorOrFacility}
                  onChange={(e) => setForm({ ...form, doctorOrFacility: e.target.value })}
                  placeholder="د. ...، مستشفى مصطفى باشا..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'تفاصيل الحدث وما تم فيه' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="النتائج، الأدوية الموصوفة، التوصيات..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'حفظ في الخط الزمني' : 'Enregistrer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
