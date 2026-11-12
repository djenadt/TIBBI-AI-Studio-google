import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Calendar,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { DoctorAppointment } from '../types/tibbi';

export const AppointmentsView: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberAppointments,
    addAppointment,
    updateAppointmentStatus,
  } = useTibbi();

  const isAr = language === 'ar';

  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    doctorName: '',
    specialty: '',
    clinicName: '',
    address: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    reason: '',
    notes: '',
  });

  const filteredAppointments = activeMemberAppointments.filter((apt) => {
    if (filterStatus === 'all') return true;
    return apt.status === filterStatus;
  });

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctorName.trim() || !form.date) return;

    addAppointment({
      patientId: activeMember.id,
      doctorName: form.doctorName,
      specialty: form.specialty || (isAr ? 'طب عام' : 'Médecine Générale'),
      clinicName: form.clinicName || (isAr ? 'العيادة الطبية' : 'Cabinet médical'),
      address: form.address,
      phone: form.phone,
      date: form.date,
      time: form.time,
      status: 'upcoming',
      reason: form.reason || (isAr ? 'استشارة طبية دورية' : 'Consultation'),
      notes: form.notes,
    });

    setIsAddModalOpen(false);
    setForm({
      doctorName: '',
      specialty: '',
      clinicName: '',
      address: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      reason: '',
      notes: '',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            <span>{isAr ? 'المواعيد والزيارات الطبية' : 'Rendez-vous & Consultations'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `تنظيم مواعيد وزيارات الطبيب للمريض: ${activeMember.fullNameAr} - التذكيرات، العيادات، وتوثيق التوصيات الطبية.`
              : `Gestion des consultations médicales de ${activeMember.fullNameFr} - Rappels et comptes-rendus.`}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? '+ حجز موعد جديد' : '+ Nouveau rendez-vous'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              filterStatus === 'all'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAr ? 'جميع المواعيد' : 'Tous les RDV'}
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              filterStatus === 'upcoming'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAr ? 'المواعيد القادمة' : 'À venir'}
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              filterStatus === 'completed'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAr ? 'الزيارات المكتملة' : 'Effectués'}
          </button>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
          {filteredAppointments.length} {isAr ? 'مواعيد' : 'rendez-vous'}
        </span>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <CalendarDays className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isAr ? 'لا توجد مواعيد مسجلة في هذا القسم.' : 'Aucun rendez-vous dans cette section.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => {
            const isUpcoming = apt.status === 'upcoming';
            const isCompleted = apt.status === 'completed';

            return (
              <div
                key={apt.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3 ${
                  isUpcoming
                    ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400 dark:hover:border-rose-500 shadow-xs ring-1 ring-rose-100 dark:ring-rose-950/40'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isUpcoming
                          ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300'
                          : isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isUpcoming ? (isAr ? 'موعد قادم' : 'À venir') : isCompleted ? (isAr ? 'زيارة مكتملة' : 'Effectué') : (isAr ? 'ملغى' : 'Annulé')}
                    </span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 block">
                        {apt.date}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{apt.time}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-tight">
                      {apt.doctorName}
                    </h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                      {apt.specialty}
                    </p>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                    <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">{isAr ? 'سبب الزيارة:' : 'Motif :'}</span>
                    {apt.reason}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{apt.clinicName} {apt.address && `- ${apt.address}`}</span>
                    </div>
                    {apt.phone && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{apt.phone}</span>
                      </div>
                    )}
                  </div>

                  {apt.notes && (
                    <div className="text-[11px] text-slate-600 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-100 dark:border-amber-900/50">
                      📝 {apt.notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  {isUpcoming ? (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? 'توثيق إتمام الزيارة' : 'Valider la visite'}</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'تمت الزيارة وموثقة' : 'Visite enregistrée'}
                    </span>
                  )}

                  {isUpcoming && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                      className="text-slate-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs cursor-pointer"
                    >
                      {isAr ? 'إلغاء الموعد' : 'Annuler'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>{isAr ? 'تسجيل موعد طبي جديد' : 'Nouveau rendez-vous médical'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'اسم الطبيب *' : 'Nom du médecin *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    placeholder="د. ..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'التخصص الطبي' : 'Spécialité'}
                  </label>
                  <input
                    type="text"
                    value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    placeholder="قلب، أطفال، عيون، عام..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'تاريخ الموعد *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الوقت' : 'Heure'}
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'العيادة أو المستشفى' : 'Cabinet ou Hôpital'}
                </label>
                <input
                  type="text"
                  value={form.clinicName}
                  onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                  placeholder="عيادة النور، مستشفى بارني..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'العنوان' : 'Adresse'}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="الشارع، المدينة..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'رقم الهاتف' : 'Téléphone'}
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="021 ... / 0550 ..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'سبب الزيارة أو المراجعة' : 'Motif de consultation'}
                </label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="متابعة دورية، حمى، ألم ظهر..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'ملاحظات أو وثائق مطلوبة' : 'Notes ou examens à apporter'}
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="إحضار التحاليل السابقة، الصيام 12 ساعة..."
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
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'حفظ الموعد' : 'Enregistrer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
