import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, Mail, Building, GraduationCap, Code, Target, Save, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import useAuthStore from '../hooks/useAuth'
import { SKILL_CATEGORIES } from '../utils/constants'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { ...user } })
  const [skills, setSkills] = useState(user?.skills || [])
  const [targets, setTargets] = useState(user?.target_roles || [])
  const [newSkill, setNewSkill] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [saving, setSaving] = useState(false)

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const res = await authAPI.updateProfile({ ...data, skills, target_roles: targets })
      updateUser(res.data)
      toast.success('Profile updated!')
    } catch {
      toast.error('Update failed')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const addTarget = () => {
    if (newTarget.trim() && !targets.includes(newTarget.trim())) {
      setTargets([...targets, newTarget.trim()])
      setNewTarget('')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="section-title">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and placement preferences</p>
      </motion.div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-neon-blue">
          {user?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">{user?.full_name}</h2>
          <p className="text-gray-400">{user?.email}</p>
          <p className="text-gray-600 text-sm mt-1">{user?.college || 'No college set'}</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-brand-400" /> Personal Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('full_name', { required: 'Required' })} className="input-field" />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} className="input-field" disabled />
            </div>
            <div>
              <label className="label">College / University</label>
              <input {...register('college')} className="input-field" placeholder="IIT Delhi..." />
            </div>
            <div>
              <label className="label">Graduation Year</label>
              <input type="number" {...register('graduation_year')} className="input-field" placeholder="2025" />
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Code className="w-4 h-4 text-cyan-400" /> My Skills</h3>
          <div className="flex gap-2 mb-4">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="input-field py-2" placeholder="Add a skill..." />
            <button type="button" onClick={addSkill} className="btn-secondary px-4 flex-shrink-0"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => (
              <span key={s} className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1">
                {s} <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {skills.length === 0 && <p className="text-gray-600 text-sm">No skills added yet</p>}
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(SKILL_CATEGORIES).flat().filter(s => !skills.includes(s)).slice(0, 20).map(s => (
                <button key={s} type="button" onClick={() => setSkills([...skills, s])}
                  className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:border-brand-500/30 transition-all">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Target Roles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-purple-400" /> Target Roles</h3>
          <div className="flex gap-2 mb-4">
            <input value={newTarget} onChange={e => setNewTarget(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTarget())}
              className="input-field py-2" placeholder="SDE-2, Product Manager..." />
            <button type="button" onClick={addTarget} className="btn-secondary px-4 flex-shrink-0"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {targets.map(t => (
              <span key={t} className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                {t} <button type="button" onClick={() => setTargets(targets.filter(x => x !== t))}><X className="w-3 h-3" /></button>
              </span>
            ))}
            {targets.length === 0 && <p className="text-gray-600 text-sm">No target roles added</p>}
          </div>
        </motion.div>

        <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </motion.button>
      </form>
    </div>
  )
}
