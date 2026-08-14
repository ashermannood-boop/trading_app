import React from 'react'
// Icons
import {
  // UI
  Eye,
  EyeOff,
  Mail,
  X,
} from "lucide-react";

const ProfileEditModal = ({
    handleProfileUpdate,
    setShowProfileEdit,
    setProfileForm,
    loading,
    profileForm,
    userdata
}) => {
  return (
  <div
     className="fixed inset-0 bg-black/70 backdrop-blur-sm flex sm:items-center justify-center z-50 P-1 sm:p-4"
     onClick={() => setShowProfileEdit(false)}
   >
     <div
       onClick={(e) => e.stopPropagation()}
       className="sm:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full sm:border sm:border-gray-800 max-h-[90vh] flex flex-col"
     >
       {/* Header */}
       <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
         <h3 className="text-lg font-semibold text-white tracking-wide">
           Edit Profile
         </h3>
 
         <button
           onClick={() => setShowProfileEdit(false)}
           className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
         >
           <X size={20} />
         </button>
       </div>
 
       {/* Form */}
       <form
         onSubmit={handleProfileUpdate}
         className="px-5 py-5 space-y-5 overflow-y-auto"
       >
         {/* Full Name */}
         <div className="space-y-2">
           <label className="text-sm text-gray-300 font-medium">
             Full Name
           </label>
 
           <input
             type="text"
             required
             value={profileForm.name}
             onChange={(e) =>
               setProfileForm({ ...profileForm, name: e.target.value })
             }
             placeholder="Enter your full name"
             className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
           />
         </div>
 
         {/* Username */}
         <div className="space-y-2">
           <label className="text-sm text-gray-300 font-medium">
             Username
           </label>
 
           <div className="relative">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
               @
             </span>
 
             <input
               type="text"
               value={profileForm.userName}
               onChange={(e) =>
                 setProfileForm({
                   ...profileForm,
                   userName: e.target.value,
                 })
               }
               placeholder="username"
               className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
             />
           </div>
         </div>
 
         {/* Email */}
         <div className="space-y-2">
           <label className="text-sm text-gray-300 font-medium">
             Email
           </label>
 
           <div className="relative">
             <Mail
               size={16}
               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
             />
 
             <input
               type="email"
               value={userdata.email}
               disabled
               className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
             />
           </div>
 
           <p className="text-xs text-gray-500">
             Email cannot be changed
           </p>
         </div>
 
         {/* Buttons */}
         <div className="flex gap-3 pt-4">
           <button
             type="button"
             onClick={() => setShowProfileEdit(false)}
             className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all duration-200"
           >
             Cancel
           </button>
 
           <button
             type="submit"
             disabled={loading}
             className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50"
           >
             {loading ? "Saving..." : "Save Changes"}
           </button>
         </div>
       </form>
     </div>
   </div>
  )
}

export default ProfileEditModal
