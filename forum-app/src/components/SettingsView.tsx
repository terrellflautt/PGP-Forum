import React, { useState } from 'react';

interface SettingsViewProps {
  user: any;
  forum: any;
  onLogout: () => void;
}

export default function SettingsView({ user, forum, onLogout }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-secondary-50 pt-16 pl-64">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-black text-secondary-900 mb-6">Settings</h1>

        <div className="flex space-x-6">
          {/* Settings Sidebar */}
          <div className="w-64 space-y-1">
            <SettingsTab
              label="Profile"
              icon="👤"
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
            />
            <SettingsTab
              label="Security"
              icon="🔒"
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
            />
            <SettingsTab
              label="Forum Settings"
              icon="⚙️"
              active={activeTab === 'forum'}
              onClick={() => setActiveTab('forum')}
            />
            <SettingsTab
              label="Billing"
              icon="💳"
              active={activeTab === 'billing'}
              onClick={() => setActiveTab('billing')}
            />
            <SettingsTab
              label="Danger Zone"
              icon="⚠️"
              active={activeTab === 'danger'}
              onClick={() => setActiveTab('danger')}
            />
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'forum' && <ForumSettings forum={forum} />}
            {activeTab === 'billing' && <BillingSettings forum={forum} />}
            {activeTab === 'danger' && <DangerZone onLogout={onLogout} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ label, icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
          : 'text-secondary-700 hover:bg-white'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ProfileSettings({ user }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Profile Settings</h2>

      <div className="space-y-6">
        <div className="flex items-center space-x-6">
          <img src={user?.picture} alt={user?.name} className="w-24 h-24 rounded-full border-4 border-primary-500" />
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">{user?.name}</h3>
            <p className="text-secondary-600">{user?.email}</p>
            <button className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
              Change Avatar
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary-900 mb-2">Display Name</label>
          <input
            type="text"
            defaultValue={user?.name}
            className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary-900 mb-2">Bio</label>
          <textarea
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">PGP Keys</h2>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🔐</div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-1">PGP Keys Active</p>
                <p className="text-sm text-green-700 mb-2">4096-bit RSA • Non-extractable</p>
                <div className="bg-white rounded p-3 font-mono text-xs text-secondary-700 break-all">
                  Fingerprint: a3f8d9e2c1b4...7f6e5d4c3b2a
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="font-semibold text-yellow-900 mb-1">Backup Your Passphrase</p>
                <p className="text-sm text-yellow-700">
                  If you lose your passphrase, ALL encrypted messages are permanently lost.
                  There is NO recovery method.
                </p>
              </div>
            </div>
          </div>

          <button className="px-6 py-3 bg-secondary-900 hover:bg-secondary-800 text-white rounded-lg font-semibold transition-colors">
            Generate New Key Pair
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">Anonymous Mode</h2>

        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🕵️</div>
                <div>
                  <p className="font-semibold text-purple-900">Anonymous Mode</p>
                  <p className="text-sm text-purple-700">WebRTC relay: 3-5 peer hops</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                Always On
              </div>
            </div>
          </div>

          <p className="text-sm text-secondary-600">
            Anonymous mode cannot be disabled. All traffic is routed through random peer relays for privacy.
          </p>
        </div>
      </div>
    </div>
  );
}

function ForumSettings({ forum }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Forum Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-secondary-900 mb-2">Forum Name</label>
          <input
            type="text"
            defaultValue={forum?.name}
            className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary-900 mb-2">Description</label>
          <textarea
            rows={3}
            placeholder="Describe your forum..."
            className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-secondary-900 mb-2">Visibility</label>
          <select className="w-full px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Public</option>
            <option>Private</option>
            <option>Invite-Only</option>
          </select>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Save Settings
        </button>
      </div>
    </div>
  );
}

function BillingSettings({ forum }: any) {
  const tiers = [
    { name: 'Free', price: '$0', users: '1,500', current: forum?.tier === 'free' },
    { name: 'Pro', price: '$29', users: '10,000', current: forum?.tier === 'pro' },
    { name: 'Business', price: '$99', users: '50,000', current: forum?.tier === 'business' },
    { name: 'Enterprise', price: '$299', users: 'Unlimited', current: forum?.tier === 'enterprise' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
        <h2 className="text-2xl font-bold text-secondary-900 mb-6">Current Plan</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-4 rounded-lg border-2 ${
                tier.current
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 bg-white'
              }`}
            >
              <div className="text-center">
                <h3 className="font-bold text-secondary-900 mb-1">{tier.name}</h3>
                <div className="text-2xl font-black text-primary-600 mb-1">{tier.price}</div>
                <p className="text-xs text-secondary-600">{tier.users} users</p>
                {tier.current && (
                  <div className="mt-2 px-2 py-1 bg-primary-500 text-white text-xs font-semibold rounded">
                    Current
                  </div>
                )}
                {!tier.current && tier.name !== 'Free' && (
                  <button className="mt-2 text-xs font-semibold text-primary-600 hover:text-primary-700">
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {forum?.tier !== 'free' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <h2 className="text-2xl font-bold text-secondary-900 mb-6">Payment Method</h2>
          <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">💳</div>
              <div>
                <p className="font-semibold text-secondary-900">Visa •••• 4242</p>
                <p className="text-sm text-secondary-600">Expires 12/25</p>
              </div>
            </div>
            <button className="text-sm font-semibold text-primary-600 hover:text-primary-700">
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DangerZone({ onLogout }: any) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200">
      <h2 className="text-2xl font-bold text-red-900 mb-6">Danger Zone</h2>

      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Delete PGP Keys</h3>
              <p className="text-sm text-red-700">
                This will permanently delete your encryption keys. You will lose access to all encrypted messages.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
              Delete Keys
            </button>
          </div>
        </div>

        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Delete Forum</h3>
              <p className="text-sm text-red-700">
                This will permanently delete your forum and all data. This action cannot be undone.
              </p>
            </div>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors">
              Delete Forum
            </button>
          </div>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Logout</h3>
              <p className="text-sm text-yellow-700">
                Sign out of your account on this device.
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-secondary-900 hover:bg-secondary-800 text-white rounded-lg font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
