import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiEdit2, FiSave, FiX, FiLogOut, FiStar, FiAlertCircle } = FiIcons;

const Profile = ({ user, onUpdate, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user.name,
    age: user.age,
    height: user.height || '',
    weight: user.weight || '',
    skillLevel: user.skillLevel,
    athleticism: user.athleticism,
    injuries: user.injuries
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const athleticismOptions = [
    { value: 'low', label: 'Developing' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'high', label: 'Athletic' }
  ];

  const injuryOptions = [
    { value: 'none', label: 'No Injuries' },
    { value: 'mild', label: 'Minor Issues' },
    { value: 'moderate', label: 'Limited Movement' },
    { value: 'severe', label: 'Significant Limitations' }
  ];

  const handleSave = () => {
    onUpdate({
      ...editData,
      age: parseInt(editData.age)
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      age: user.age,
      height: user.height || '',
      weight: user.weight || '',
      skillLevel: user.skillLevel,
      athleticism: user.athleticism,
      injuries: user.injuries
    });
    setIsEditing(false);
  };

  const getAgeCategory = (age) => {
    const ageNum = parseInt(age);
    if (ageNum <= 12) return { label: 'Youth', color: 'green' };
    if (ageNum <= 17) return { label: 'Teen', color: 'blue' };
    return { label: 'Adult', color: 'purple' };
  };

  const ageCategory = getAgeCategory(user.age);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUser} className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 bg-${ageCategory.color}-500/30 rounded-full text-xs font-medium`}>
                    {ageCategory.label} Athlete
                  </span>
                  {user.isPremium && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-yellow-500/30 rounded-full text-xs font-medium">
                      <SafeIcon icon={FiStar} className="w-3 h-3" />
                      <span>Premium</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({...editData, age: e.target.value})}
                    min="8"
                    max="99"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
                  <input
                    type="text"
                    value={editData.height}
                    onChange={(e) => setEditData({...editData, height: e.target.value})}
                    placeholder="e.g., 5'10&quot;"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <input
                    type="text"
                    value={editData.weight}
                    onChange={(e) => setEditData({...editData, weight: e.target.value})}
                    placeholder="e.g., 165 lbs"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {skillLevelOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEditData({...editData, skillLevel: option.value})}
                      className={`p-3 border rounded-xl transition-all text-sm font-medium ${
                        editData.skillLevel === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Athleticism</label>
                <div className="grid grid-cols-3 gap-2">
                  {athleticismOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEditData({...editData, athleticism: option.value})}
                      className={`p-3 border rounded-xl transition-all text-sm font-medium ${
                        editData.athleticism === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Injury Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {injuryOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setEditData({...editData, injuries: option.value})}
                      className={`p-3 border rounded-xl transition-all text-sm font-medium ${
                        editData.injuries === option.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <ProfileField label="Age" value={`${user.age} years old`} />
                <ProfileField label="Height" value={user.height || 'Not set'} />
                <ProfileField label="Weight" value={user.weight || 'Not set'} />
                <ProfileField 
                  label="Skill Level" 
                  value={user.skillLevel?.charAt(0).toUpperCase() + user.skillLevel?.slice(1)} 
                />
                <ProfileField 
                  label="Athleticism" 
                  value={
                    user.athleticism === 'low' ? 'Developing' :
                    user.athleticism === 'moderate' ? 'Moderate' : 'Athletic'
                  } 
                />
                <ProfileField 
                  label="Injury Status" 
                  value={
                    user.injuries === 'none' ? 'No Injuries' :
                    user.injuries === 'mild' ? 'Minor Issues' :
                    user.injuries === 'moderate' ? 'Limited Movement' : 'Significant Limitations'
                  }
                  highlight={user.injuries !== 'none'}
                />
              </div>

              {/* Injury Warning */}
              {user.injuries && user.injuries !== 'none' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Injury Status Active</h4>
                      <p className="text-sm text-yellow-700">
                        Your training plans are being modified to accommodate your current condition.
                        Update your status when you're fully recovered.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Account</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {!user.isPremium && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">Upgrade to Premium</p>
                          <p className="text-sm text-gray-600">Get up to 20 active goals</p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-600 transition-all">
                          Upgrade
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Log Out?</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to log out? Your data will be saved.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({ label, value, highlight }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`font-medium ${highlight ? 'text-yellow-700' : 'text-gray-900'}`}>{value}</p>
  </div>
);

export default Profile;
