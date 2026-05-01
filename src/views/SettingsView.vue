<template>
  <div class="row">
    <div class="col-12">
      <!-- Page Header -->
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">
            <i class="ti ti-settings-2 me-2"></i>
            Account Settings
          </h4>
          <p class="text-muted mb-0">
            Manage your preferences, notifications, and security settings
          </p>
        </div>
      </div>

      <div class="row">
        <!-- Settings Sidebar -->
        <div class="col-xl-3 col-lg-4">
          <div class="card">
            <div class="list-group list-group-flush">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="list-group-item list-group-item-action d-flex align-items-center"
                :class="{ active: activeTab === tab.id }"
              >
                <i :class="`ti ${tab.icon} me-2 fs-5`"></i>
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-xl-9 col-lg-8">
          <!-- Display Preferences -->
          <div v-if="activeTab === 'display'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-palette me-2"></i>
                Display Preferences
              </h5>

              <form @submit.prevent="saveDisplaySettings">
                <!-- Theme Mode -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Theme Mode</label>
                  <div class="row g-3">
                    <div class="col-md-4">
                      <div class="form-check card-radio">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="theme"
                          id="theme-light"
                          value="light"
                          v-model="settings.theme"
                        />
                        <label class="form-check-label" for="theme-light">
                          <div class="d-flex align-items-center">
                            <i class="ti ti-sun fs-3 me-2"></i>
                            <div>
                              <div class="fw-semibold">Light</div>
                              <small class="text-muted">Bright theme</small>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-check card-radio">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="theme"
                          id="theme-dark"
                          value="dark"
                          v-model="settings.theme"
                        />
                        <label class="form-check-label" for="theme-dark">
                          <div class="d-flex align-items-center">
                            <i class="ti ti-moon fs-3 me-2"></i>
                            <div>
                              <div class="fw-semibold">Dark</div>
                              <small class="text-muted">Dark theme</small>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-check card-radio">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="theme"
                          id="theme-system"
                          value="system"
                          v-model="settings.theme"
                        />
                        <label class="form-check-label" for="theme-system">
                          <div class="d-flex align-items-center">
                            <i class="ti ti-sun-moon fs-3 me-2"></i>
                            <div>
                              <div class="fw-semibold">System</div>
                              <small class="text-muted">Auto detect</small>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pagination -->
                <div class="mb-4">
                  <label for="items-per-page" class="form-label fw-semibold">Items per page</label>
                  <select id="items-per-page" class="form-select" v-model="settings.itemsPerPage">
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <div class="form-text">Number of items to display per page in tables</div>
                </div>

                <!-- Text Size -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Text Size</label>
                  <div class="btn-group w-100" role="group">
                    <input
                      type="radio"
                      class="btn-check"
                      name="text-size"
                      id="text-small"
                      value="small"
                      v-model="settings.textSize"
                    />
                    <label class="btn btn-outline-primary" for="text-small">Small</label>

                    <input
                      type="radio"
                      class="btn-check"
                      name="text-size"
                      id="text-medium"
                      value="medium"
                      v-model="settings.textSize"
                    />
                    <label class="btn btn-outline-primary" for="text-medium">Medium</label>

                    <input
                      type="radio"
                      class="btn-check"
                      name="text-size"
                      id="text-large"
                      value="large"
                      v-model="settings.textSize"
                    />
                    <label class="btn btn-outline-primary" for="text-large">Large</label>
                  </div>
                </div>

                <!-- Monochrome Mode -->
                <div class="mb-4">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="monochrome"
                      v-model="settings.monochromeMode"
                    />
                    <label class="form-check-label" for="monochrome">
                      <span class="fw-semibold">Monochrome Mode</span>
                      <div class="text-muted small">High contrast black and white display</div>
                    </label>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetDisplaySettings">
                    Reset
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ti ti-check me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Regional Preferences -->
          <div v-if="activeTab === 'regional'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-world me-2"></i>
                Regional Preferences
              </h5>

              <form @submit.prevent="saveRegionalSettings">
                <!-- Language -->
                <div class="mb-4">
                  <label for="language" class="form-label fw-semibold">Language</label>
                  <select id="language" class="form-select" v-model="settings.language">
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <!-- Timezone -->
                <div class="mb-4">
                  <label for="timezone" class="form-label fw-semibold">Timezone</label>
                  <select id="timezone" class="form-select" v-model="settings.timezone">
                    <option value="Africa/Kinshasa">Africa/Kinshasa (GMT+1)</option>
                    <option value="Africa/Lubumbashi">Africa/Lubumbashi (GMT+2)</option>
                    <option value="Africa/Harare">Africa/Harare (GMT+2)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                    <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (GMT+3)</option>
                    <option value="Africa/Kampala">Africa/Kampala (GMT+3)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>

                <!-- Date Format -->
                <div class="mb-4">
                  <label for="date-format" class="form-label fw-semibold">Date Format</label>
                  <select id="date-format" class="form-select" v-model="settings.dateFormat">
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                  </select>
                </div>

                <!-- Currency Format -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Currency Symbol Position</label>
                  <div class="btn-group w-100" role="group">
                    <input
                      type="radio"
                      class="btn-check"
                      name="currency-position"
                      id="currency-before"
                      value="before"
                      v-model="settings.currencyPosition"
                    />
                    <label class="btn btn-outline-primary" for="currency-before"
                      >$100.00 (Before)</label
                    >

                    <input
                      type="radio"
                      class="btn-check"
                      name="currency-position"
                      id="currency-after"
                      value="after"
                      v-model="settings.currencyPosition"
                    />
                    <label class="btn btn-outline-primary" for="currency-after"
                      >100.00$ (After)</label
                    >
                  </div>
                </div>

                <!-- Number Format -->
                <div class="mb-4">
                  <label for="number-separator" class="form-label fw-semibold"
                    >Thousand Separator</label
                  >
                  <select
                    id="number-separator"
                    class="form-select"
                    v-model="settings.thousandSeparator"
                  >
                    <option value=",">Comma (1,000,000)</option>
                    <option value=".">Period (1.000.000)</option>
                    <option value=" ">Space (1 000 000)</option>
                  </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetRegionalSettings">
                    Reset
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ti ti-check me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Notifications -->
          <div v-if="activeTab === 'notifications'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-bell me-2"></i>
                Notifications & Alerts
              </h5>

              <form @submit.prevent="saveNotificationSettings">
                <!-- Email Notifications -->
                <div class="mb-4">
                  <h6 class="fw-semibold mb-3">Email Notifications</h6>
                  <div class="form-check form-switch mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="email-transactions"
                      v-model="settings.notifications.email.transactions"
                    />
                    <label class="form-check-label" for="email-transactions">
                      Transaction notifications
                    </label>
                  </div>
                  <div class="form-check form-switch mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="email-validations"
                      v-model="settings.notifications.email.validations"
                    />
                    <label class="form-check-label" for="email-validations">
                      Validation requests
                    </label>
                  </div>
                  <div class="form-check form-switch mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="email-reports"
                      v-model="settings.notifications.email.reports"
                    />
                    <label class="form-check-label" for="email-reports"> Daily reports </label>
                  </div>
                </div>

                <!-- Push Notifications -->
                <div class="mb-4">
                  <h6 class="fw-semibold mb-3">Push Notifications</h6>
                  <div class="form-check form-switch mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="push-transactions"
                      v-model="settings.notifications.push.transactions"
                    />
                    <label class="form-check-label" for="push-transactions">
                      Transaction notifications
                    </label>
                  </div>
                  <div class="form-check form-switch mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="push-validations"
                      v-model="settings.notifications.push.validations"
                    />
                    <label class="form-check-label" for="push-validations">
                      Validation requests
                    </label>
                  </div>
                </div>

                <!-- Transaction Alerts -->
                <div class="mb-4">
                  <h6 class="fw-semibold mb-3">Transaction Alerts</h6>
                  <div class="form-check form-switch mb-3">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="alert-large-transactions"
                      v-model="settings.notifications.alertLargeTransactions"
                    />
                    <label class="form-check-label" for="alert-large-transactions">
                      Alert for large transactions
                    </label>
                  </div>

                  <div v-if="settings.notifications.alertLargeTransactions">
                    <label for="alert-threshold" class="form-label">Alert threshold amount</label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                        type="number"
                        class="form-control"
                        id="alert-threshold"
                        v-model="settings.notifications.alertThreshold"
                        min="0"
                        step="100"
                      />
                    </div>
                    <div class="form-text">
                      You'll receive an alert for transactions above this amount
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    @click="resetNotificationSettings"
                  >
                    Reset
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ti ti-check me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-shield-lock me-2"></i>
                Security Settings
              </h5>

              <form @submit.prevent="saveSecuritySettings">
                <!-- Two-Factor Authentication -->
                <div class="mb-4">
                  <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                      <h6 class="fw-semibold mb-1">{{ t('settings.security.twoFactor.title') }}</h6>
                      <p class="text-muted small mb-0">
                        {{ t('settings.security.twoFactor.description') }}
                      </p>
                      <span v-if="twoFactorEnabled" class="badge bg-success mt-2">
                        <i class="ti ti-check me-1"></i
                        >{{ t('settings.security.twoFactor.enabled') }}
                      </span>
                      <span v-else class="badge bg-secondary mt-2">
                        <i class="ti ti-x me-1"></i>{{ t('settings.security.twoFactor.disabled') }}
                      </span>
                    </div>
                    <div>
                      <button
                        v-if="!twoFactorEnabled"
                        type="button"
                        class="btn btn-primary btn-sm"
                        @click="enable2FA"
                        :disabled="enabling2FA"
                      >
                        <span
                          v-if="enabling2FA"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        <i v-else class="ti ti-shield-lock me-2"></i>
                        {{ t('settings.security.twoFactor.enable') }}
                      </button>
                      <button
                        v-else
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        @click="disable2FA"
                      >
                        <i class="ti ti-shield-off me-2"></i>
                        {{ t('settings.security.twoFactor.disable') }}
                      </button>
                    </div>
                  </div>
                </div>

                <hr />

                <!-- Auto-lock -->
                <div class="mb-4">
                  <h6 class="fw-semibold mb-3">Auto-lock</h6>
                  <label for="auto-lock-time" class="form-label"
                    >Lock screen after inactivity</label
                  >
                  <select
                    id="auto-lock-time"
                    class="form-select"
                    v-model="settings.security.autoLockMinutes"
                  >
                    <option value="0">Never</option>
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                  <div class="form-text">
                    <i class="ti ti-info-circle me-1"></i>
                    Your screen will be locked automatically after the specified period of
                    inactivity. You'll need to enter your password to unlock.
                  </div>
                  <div
                    v-if="settings.security.autoLockMinutes > 0"
                    class="alert alert-info alert-sm mt-2 mb-0"
                  >
                    <i class="ti ti-shield-check me-1"></i>
                    Auto-lock is currently active ({{ settings.security.autoLockMinutes }} minute{{
                      settings.security.autoLockMinutes !== 1 ? 's' : ''
                    }})
                  </div>
                </div>

                <!-- Require Password -->
                <div class="mb-4">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="require-password"
                      v-model="settings.security.requirePasswordForSensitive"
                    />
                    <label class="form-check-label" for="require-password">
                      <span class="fw-semibold">Require password for sensitive actions</span>
                      <div class="text-muted small">
                        Re-enter password before deleting or approving transactions
                      </div>
                    </label>
                  </div>
                </div>

                <hr />

                <!-- Active Sessions -->
                <div class="mb-4">
                  <h6 class="fw-semibold mb-3">Active Sessions</h6>
                  <p class="text-muted small mb-3">
                    Manage devices where you're currently logged in
                  </p>

                  <div v-if="sessionsLoading" class="text-center my-3">
                    <span class="spinner-border spinner-border-sm"></span> Loading sessions...
                  </div>
                  <div v-else>
                    <div v-if="sessions.length === 0" class="alert alert-warning">
                      <i class="ti ti-alert-circle me-2"></i> Unable to load sessions. Please
                      refresh the page.
                    </div>
                    <div
                      v-else-if="sessions.length === 1 && sessions[0]?.id === currentSessionId"
                      class="alert alert-info"
                    >
                      <i class="ti ti-info-circle me-2"></i> No other active sessions. Only this
                      device is signed in.
                    </div>
                    <ul v-else class="list-group mb-2">
                      <li
                        v-for="session in sessions"
                        :key="session.id"
                        class="list-group-item d-flex justify-content-between align-items-center"
                        :class="{ 'bg-light': session.id === currentSessionId }"
                      >
                        <div>
                          <i
                            :class="
                              session.id === currentSessionId
                                ? 'ti ti-device-desktop text-primary me-2'
                                : 'ti ti-device-laptop me-2'
                            "
                          ></i>
                          <span class="fw-semibold">{{ session.name || 'Browser Session' }}</span>
                          <div class="text-muted small mt-1">
                            <span>Created: {{ format.dateTime(session.created_at) }}</span>
                            <span v-if="session.last_used_at" class="ms-2"
                              >Last used: {{ format.dateTime(session.last_used_at) }}</span
                            >
                          </div>
                          <span v-if="session.id === currentSessionId" class="badge bg-primary mt-1"
                            >Current Device</span
                          >
                        </div>
                        <button
                          v-if="session.id !== currentSessionId"
                          type="button"
                          class="btn btn-sm btn-outline-danger"
                          @click="revokeSession(session.id)"
                        >
                          <i class="ti ti-logout me-1"></i> Revoke
                        </button>
                      </li>
                    </ul>
                    <button
                      v-if="
                        sessions.length > 1 ||
                        (sessions.length === 1 && sessions[0]?.id !== currentSessionId)
                      "
                      type="button"
                      class="btn btn-sm btn-outline-warning"
                      @click="revokeOtherSessions"
                    >
                      <i class="ti ti-logout me-1"></i> Revoke all other sessions
                    </button>
                  </div>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetSecuritySettings">
                    Reset
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ti ti-check me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Transaction Settings -->
          <div v-if="activeTab === 'transactions'" class="card">
            <div class="card-body">
              <h5 class="card-title mb-4">
                <i class="ti ti-receipt me-2"></i>
                Transaction Settings
              </h5>

              <form @submit.prevent="saveTransactionSettings">
                <!-- Default Currency -->
                <div class="mb-4">
                  <label for="default-currency" class="form-label fw-semibold"
                    >Default Currency</label
                  >
                  <select
                    id="default-currency"
                    class="form-select"
                    v-model="settings.transactions.defaultCurrency"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="CDF">CDF - Congolese Franc</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>

                <!-- Default Branch -->
                <div class="mb-4">
                  <label for="default-branch" class="form-label fw-semibold">Default Branch</label>
                  <select
                    id="default-branch"
                    class="form-select"
                    v-model="settings.transactions.defaultBranchId"
                  >
                    <option :value="null">None (Select each time)</option>
                    <!-- Will be populated dynamically -->
                  </select>
                  <div class="form-text">
                    This branch will be pre-selected when creating transactions
                  </div>
                </div>

                <!-- Auto-print Receipt -->
                <div class="mb-4">
                  <div class="form-check form-switch">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="auto-print"
                      v-model="settings.transactions.autoPrintReceipt"
                    />
                    <label class="form-check-label" for="auto-print">
                      <span class="fw-semibold">Auto-print receipts</span>
                      <div class="text-muted small">
                        Automatically open print dialog after completing a transaction
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Receipt Format -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Receipt Format</label>
                  <div class="row g-3">
                    <div class="col-md-6">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="receipt-format"
                          id="receipt-a4"
                          value="A4"
                          v-model="settings.transactions.receiptFormat"
                        />
                        <label class="form-check-label" for="receipt-a4">
                          A4 (210mm x 297mm)
                        </label>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          name="receipt-format"
                          id="receipt-thermal"
                          value="thermal"
                          v-model="settings.transactions.receiptFormat"
                        />
                        <label class="form-check-label" for="receipt-thermal">
                          Thermal (80mm)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Receipt Language -->
                <div class="mb-4">
                  <label for="receipt-language" class="form-label fw-semibold"
                    >Receipt Language</label
                  >
                  <select
                    id="receipt-language"
                    class="form-select"
                    v-model="settings.transactions.receiptLanguage"
                  >
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div class="d-flex justify-content-end gap-2">
                  <button type="button" class="btn btn-secondary" @click="resetTransactionSettings">
                    Reset
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ti ti-check me-2"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 2FA Setup Modal -->
  <div
    class="modal fade"
    id="twoFactorModal"
    tabindex="-1"
    aria-labelledby="twoFactorModalLabel"
    aria-hidden="true"
    data-bs-backdrop="static"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="twoFactorModalLabel">
            <i class="ti ti-shield-lock me-2"></i>
            {{ t('settings.security.twoFactor.modalTitle') }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="cancel2FASetup"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="!twoFactorConfirmed">
            <p class="text-muted mb-3">
              {{ t('settings.security.twoFactor.scanQRCode') }}
            </p>
            <div class="text-center mb-3">
              <div v-if="twoFactorQR" v-html="generateQRCode(twoFactorQR)"></div>
              <div v-else class="spinner-border text-primary"></div>
            </div>
            <div v-if="twoFactorSecret" class="alert alert-info">
              <small class="fw-semibold">{{ t('settings.security.twoFactor.secretKey') }}</small>
              <div class="font-monospace small mt-1">{{ twoFactorSecret }}</div>
            </div>
            <hr />
            <div class="mb-3">
              <label for="verification-code" class="form-label fw-semibold">
                {{ t('settings.security.twoFactor.enterCode') }}
              </label>
              <input
                type="text"
                class="form-control"
                id="verification-code"
                v-model="verificationCode"
                placeholder="000000"
                maxlength="6"
                pattern="[0-9]{6}"
                inputmode="numeric"
                @input="verificationCode = verificationCode.replace(/[^0-9]/g, '')"
              />
              <div class="form-text">
                <i class="ti ti-info-circle me-1"></i>
                {{ t('settings.security.twoFactor.codeHelp') }}
              </div>
            </div>
          </div>
          <div v-else class="text-center">
            <i class="ti ti-circle-check text-success" style="font-size: 4rem"></i>
            <h5 class="mt-3">{{ t('settings.security.twoFactor.successMessage') }}</h5>
            <p class="text-muted">{{ t('settings.security.twoFactor.protected') }}</p>
          </div>
        </div>
        <div class="modal-footer" v-if="!twoFactorConfirmed">
          <button type="button" class="btn btn-secondary" @click="cancel2FASetup">
            {{ t('settings.security.twoFactor.cancel') }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="confirm2FA"
            :disabled="
              !twoFactorQR ||
              !twoFactorSecret ||
              !verificationCode ||
              verificationCode.length !== 6 ||
              confirming2FA
            "
          >
            <span v-if="confirming2FA" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="ti ti-check me-2"></i>
            {{ t('settings.security.twoFactor.verifyButton') }}
          </button>
        </div>
        <div class="modal-footer" v-else>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="close2FAModal"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import Swal from 'sweetalert2'
import { applyTheme, applyMonochromeMode, applyTextSize } from '@/utils/theme'
import { changeLocale } from '@/plugins/i18n'
import { useUserSettings } from '@/composables/useUserSettings'
import { useI18n } from '@/composables/useI18n'
import { useFormat } from '@/plugins/format'

const { t } = useI18n()
const { refreshSettings } = useUserSettings()
const format = useFormat()

const authStore = useAuthStore()

// Active tab
const activeTab = ref('display')

// Tabs
const tabs = [
  { id: 'display', label: 'Display', icon: 'ti-palette' },
  { id: 'regional', label: 'Regional', icon: 'ti-world' },
  { id: 'notifications', label: 'Notifications', icon: 'ti-bell' },
  { id: 'security', label: 'Security', icon: 'ti-shield-lock' },
  { id: 'transactions', label: 'Transactions', icon: 'ti-receipt' },
]

// Saving state
const saving = ref(false)
const loading = ref(true)

// Default settings structure
const defaultSettings = {
  // Display
  theme: 'light',
  itemsPerPage: 25,
  textSize: 'medium',
  monochromeMode: false,

  // Regional
  language: 'fr',
  timezone: 'Africa/Kinshasa',
  dateFormat: 'DD/MM/YYYY',
  currencyPosition: 'before',
  thousandSeparator: ',',

  // Notifications
  notifications: {
    email: {
      transactions: true,
      validations: true,
      reports: false,
    },
    push: {
      transactions: true,
      validations: true,
    },
    alertLargeTransactions: true,
    alertThreshold: 10000,
  },

  // Security
  security: {
    twoFactorAuth: false,
    autoLockMinutes: 15,
    requirePasswordForSensitive: true,
  },

  // Transactions
  transactions: {
    defaultCurrency: 'USD',
    defaultBranchId: null as number | null,
    autoPrintReceipt: false,
    receiptFormat: 'thermal',
    receiptLanguage: 'fr',
  },
}

// Settings state
const settings = ref({ ...defaultSettings })

// --- Sessions state and logic ---
interface Session {
  id: number
  name?: string
  created_at: string
  last_used_at?: string
}

const sessions = ref<Session[]>([])
const sessionsLoading = ref(false)
const currentSessionId = ref<number | null>(null)

// --- 2FA state and logic ---
const twoFactorEnabled = ref(false)
const enabling2FA = ref(false)
const confirming2FA = ref(false)
const twoFactorConfirmed = ref(false)
const twoFactorQR = ref('')
const twoFactorSecret = ref('')
const verificationCode = ref('')
let twoFactorModalInstance: any = null

const loadSessions = async () => {
  sessionsLoading.value = true
  try {
    const response = await axiosInstance.get(`${appConfig.apiUrl}/user/sessions`)
    console.log('Sessions API response:', response.data)

    // Handle different possible response structures
    const data = response.data.data || response.data
    sessions.value = data?.sessions || []
    currentSessionId.value = data?.current_session_id || null

    console.log('Loaded sessions:', sessions.value)
    console.log('Current session ID:', currentSessionId.value)
  } catch (e) {
    console.error('Failed to load sessions:', e)
    sessions.value = []

    Swal.fire({
      title: t('settings.security.sessions.failedToLoad'),
      text: t('settings.security.sessions.failedToLoad'),
      icon: 'error',
      toast: true,
      position: 'top-end',
      timer: 3000,
      showConfirmButton: false,
    })
  } finally {
    sessionsLoading.value = false
  }
}

const revokeSession = async (id: number) => {
  if (!id) return
  const confirm = await Swal.fire({
    title: t('settings.security.sessions.revokeConfirm'),
    text: t('settings.security.sessions.revokeWarning'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('settings.security.sessions.yesRevoke'),
    confirmButtonColor: '#dc3545',
  })
  if (confirm.isConfirmed) {
    try {
      await axiosInstance.delete(`${appConfig.apiUrl}/user/sessions/${id}`)
      await loadSessions()
      Swal.fire({
        title: t('settings.security.sessions.sessionRevoked'),
        text: t('settings.security.sessions.sessionRevoked'),
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire({
        title: t('common.error'),
        text: error.response?.data?.message || 'Failed to revoke session',
        icon: 'error',
      })
    }
  }
}

const revokeOtherSessions = async () => {
  const confirm = await Swal.fire({
    title: t('settings.security.sessions.revokeOthersConfirm'),
    text: t('settings.security.sessions.revokeOthersWarning'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('settings.security.sessions.yesRevoke'),
    confirmButtonColor: '#dc3545',
  })
  if (confirm.isConfirmed) {
    try {
      await axiosInstance.delete(`${appConfig.apiUrl}/user/sessions`)
      await loadSessions()
      Swal.fire({
        title: t('common.success'),
        text: t('settings.security.sessions.sessionsRevoked'),
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire({
        title: t('common.error'),
        text: error.response?.data?.message || 'Failed to revoke sessions',
        icon: 'error',
      })
    }
  }
}

// Load settings from API on mount
onMounted(async () => {
  await loadSettings()
  await loadSessions()
  await check2FAStatus()

  // Initialize Bootstrap modal
  const modalEl = document.getElementById('twoFactorModal')
  if (modalEl && typeof window !== 'undefined' && (window as any).bootstrap) {
    twoFactorModalInstance = new (window as any).bootstrap.Modal(modalEl)
  }
})

// Watch for theme changes and apply them immediately (live preview)
watch(
  () => settings.value.theme,
  (newTheme) => {
    if (newTheme) {
      applyTheme(newTheme as any)
    }
  }
)

// Watch for monochrome mode changes and apply them immediately (live preview)
watch(
  () => settings.value.monochromeMode,
  (newMode) => {
    applyMonochromeMode(newMode)
  }
)

// Watch for text size changes and apply them immediately (live preview)
watch(
  () => settings.value.textSize,
  (newSize) => {
    if (newSize) {
      applyTextSize(newSize as any)
    }
  }
)

// Load settings from API
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await axiosInstance.get(`${appConfig.apiUrl}/user/settings`)
    const userSettings = response.data.data?.settings || response.data?.settings || {}

    // Merge with defaults to ensure all keys exist
    settings.value = {
      ...defaultSettings,
      ...userSettings,
      notifications: {
        ...defaultSettings.notifications,
        ...(userSettings.notifications || {}),
        email: {
          ...defaultSettings.notifications.email,
          ...(userSettings.notifications?.email || {}),
        },
        push: {
          ...defaultSettings.notifications.push,
          ...(userSettings.notifications?.push || {}),
        },
      },
      security: {
        ...defaultSettings.security,
        ...(userSettings.security || {}),
      },
      transactions: {
        ...defaultSettings.transactions,
        ...(userSettings.transactions || {}),
      },
    }

    // Also save to localStorage as backup
    localStorage.setItem('userSettings', JSON.stringify(settings.value))

    // Apply theme settings immediately
    applyTheme(settings.value.theme as any)
    applyMonochromeMode(settings.value.monochromeMode)
    applyTextSize(settings.value.textSize as any)
  } catch (error: any) {
    console.error('Failed to load settings from API:', error)

    // Fallback to localStorage
    const savedSettings = localStorage.getItem('userSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...defaultSettings, ...parsed }

        // Apply theme settings from localStorage
        applyTheme(settings.value.theme as any)
        applyMonochromeMode(settings.value.monochromeMode)
        applyTextSize(settings.value.textSize as any)
      } catch (parseError) {
        console.error('Failed to parse localStorage settings:', parseError)
      }
    }
  } finally {
    loading.value = false
  }
}

// Save settings to API
const saveSettingsToAPI = async () => {
  try {
    await axiosInstance.put(`${appConfig.apiUrl}/user/settings`, {
      settings: settings.value,
    })

    // Update localStorage as well
    localStorage.setItem('userSettings', JSON.stringify(settings.value))

    // Refresh user data to get updated settings
    await authStore.fetchUser()

    return true
  } catch (error: any) {
    console.error('Failed to save settings to API:', error)
    throw error
  }
}

// Save handlers
const saveDisplaySettings = async () => {
  saving.value = true
  try {
    await saveSettingsToAPI()

    // Apply theme immediately
    applyTheme(settings.value.theme as any)
    applyMonochromeMode(settings.value.monochromeMode)
    applyTextSize(settings.value.textSize as any)

    Swal.fire({
      title: t('common.success'),
      text: t('settings.security.saved'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: t('common.error'),
      text: error.response?.data?.message || 'Failed to save settings',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const saveRegionalSettings = async () => {
  saving.value = true
  try {
    await saveSettingsToAPI()

    // Apply language/locale immediately
    const userLang = settings.value.language === 'en' ? 'en-US' : 'fr-FR'
    changeLocale(userLang)

    // Refresh user settings (to update computed refs)
    refreshSettings()

    Swal.fire({
      title: t('common.success'),
      text: t('settings.security.saved'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: t('common.error'),
      text: error.response?.data?.message || 'Failed to save settings',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const saveNotificationSettings = async () => {
  saving.value = true
  try {
    await saveSettingsToAPI()

    Swal.fire({
      title: t('common.success'),
      text: t('settings.security.saved'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: t('common.error'),
      text: error.response?.data?.message || 'Failed to save settings',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const saveSecuritySettings = async () => {
  saving.value = true
  try {
    await saveSettingsToAPI()

    Swal.fire({
      title: t('common.success'),
      text: t('settings.security.saved'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: t('common.error'),
      text: error.response?.data?.message || 'Failed to save settings',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

const saveTransactionSettings = async () => {
  saving.value = true
  try {
    await saveSettingsToAPI()

    Swal.fire({
      title: t('common.success'),
      text: t('settings.security.saved'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })
  } catch (error: any) {
    Swal.fire({
      title: t('common.error'),
      text: error.response?.data?.message || 'Failed to save settings',
      icon: 'error',
    })
  } finally {
    saving.value = false
  }
}

// Reset handlers
const resetDisplaySettings = () => {
  settings.value.theme = defaultSettings.theme
  settings.value.itemsPerPage = defaultSettings.itemsPerPage
  settings.value.textSize = defaultSettings.textSize
  settings.value.monochromeMode = defaultSettings.monochromeMode
}

const resetRegionalSettings = () => {
  settings.value.language = defaultSettings.language
  settings.value.timezone = defaultSettings.timezone
  settings.value.dateFormat = defaultSettings.dateFormat
  settings.value.currencyPosition = defaultSettings.currencyPosition
  settings.value.thousandSeparator = defaultSettings.thousandSeparator
}

const resetNotificationSettings = () => {
  settings.value.notifications = { ...defaultSettings.notifications }
}

const resetSecuritySettings = () => {
  settings.value.security = { ...defaultSettings.security }
}

const resetTransactionSettings = () => {
  settings.value.transactions = { ...defaultSettings.transactions }
}

// --- 2FA Functions ---
const check2FAStatus = async () => {
  try {
    const response = await axiosInstance.get(`${appConfig.apiUrl}/user`)
    const data = response.data.data || response.data
    twoFactorEnabled.value = data?.two_factor_enabled || false
  } catch (error) {
    console.error('Failed to check 2FA status:', error)
  }
}

const enable2FA = async () => {
  enabling2FA.value = true
  try {
    const response = await axiosInstance.post(`${appConfig.apiUrl}/user/2fa/enable`)

    // Handle different possible response structures
    const data = response.data.data || response.data
    twoFactorQR.value = data.qr || ''
    twoFactorSecret.value = data.secret || ''
    verificationCode.value = ''
    twoFactorConfirmed.value = false

    // Show modal
    if (twoFactorModalInstance) {
      twoFactorModalInstance.show()
    }
  } catch (error: any) {
    Swal.fire({
      title: t('settings.security.twoFactor.error'),
      text: error.response?.data?.message || 'Failed to enable 2FA',
      icon: 'error',
    })
  } finally {
    enabling2FA.value = false
  }
}

const confirm2FA = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    Swal.fire({
      title: t('settings.security.twoFactor.invalidCode'),
      text: t('settings.security.twoFactor.enterSixDigits'),
      icon: 'warning',
    })
    return
  }

  confirming2FA.value = true
  try {
    console.log('Confirming 2FA with code:', verificationCode.value)
    const response = await axiosInstance.post(`${appConfig.apiUrl}/user/2fa/confirm`, {
      code: verificationCode.value,
    })
    console.log('2FA confirm response:', response.data)

    twoFactorConfirmed.value = true
    twoFactorEnabled.value = true

    Swal.fire({
      title: t('settings.security.twoFactor.success'),
      text: t('settings.security.twoFactor.successMessage'),
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
    })

    // Auto-close modal after 2 seconds
    setTimeout(() => {
      close2FAModal()
    }, 2000)
  } catch (error: any) {
    console.error('2FA confirm error:', error)
    console.error('Error response:', error.response)
    Swal.fire({
      title: t('settings.security.twoFactor.error'),
      text: error.response?.data?.message || error.message || 'Invalid verification code',
      icon: 'error',
    })
  } finally {
    confirming2FA.value = false
  }
}

const disable2FA = async () => {
  const confirm = await Swal.fire({
    title: t('settings.security.twoFactor.disableConfirm'),
    text: t('settings.security.twoFactor.disableWarning'),
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: t('settings.security.twoFactor.yesDisable'),
    confirmButtonColor: '#dc3545',
  })

  if (confirm.isConfirmed) {
    try {
      await axiosInstance.post(`${appConfig.apiUrl}/user/2fa/disable`)
      twoFactorEnabled.value = false

      Swal.fire({
        title: t('settings.security.twoFactor.success'),
        text: t('settings.security.twoFactor.disabledSuccess'),
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error: any) {
      Swal.fire({
        title: t('settings.security.twoFactor.error'),
        text: error.response?.data?.message || 'Failed to disable 2FA',
        icon: 'error',
      })
    }
  }
}

const cancel2FASetup = () => {
  verificationCode.value = ''
  twoFactorQR.value = ''
  twoFactorSecret.value = ''
  twoFactorConfirmed.value = false

  if (twoFactorModalInstance) {
    twoFactorModalInstance.hide()
  }
}

const close2FAModal = () => {
  cancel2FASetup()
}

const generateQRCode = (uri: string) => {
  // Use a simple inline SVG QR code generator or library
  // For now, we'll use an external service
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    uri
  )}" alt="QR Code" class="img-fluid" />`
}
</script>

<style scoped>
.card-radio {
  padding: 1rem;
  border: 2px solid var(--bs-border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.card-radio:hover {
  border-color: var(--bs-primary);
}

.card-radio .form-check-input:checked ~ .form-check-label {
  color: var(--bs-primary);
}

.card-radio .form-check-input:checked {
  display: none;
}

.card-radio .form-check-input:checked ~ .form-check-label::before {
  content: '✓';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: var(--bs-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.card-radio .form-check-label {
  position: relative;
  cursor: pointer;
  width: 100%;
}
</style>
