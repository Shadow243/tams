<template>
  <div
    :class="['modal', { show: show }]"
    :style="{ display: show ? 'block' : 'none' }"
    tabindex="-1"
    role="dialog"
  >
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ti ti-receipt me-2"></i>
            {{ t('transactions.receipt') || 'Reçu de Transaction' }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">
          <div id="receipt-content" ref="receiptContent" class="receipt-container p-4">
            <!-- Header -->
            <div class="text-center mb-4 border-bottom pb-3">
              <h3 class="fw-bold mb-1">{{ appConfig.appName }}</h3>
              <p class="text-muted mb-0 small">
                {{ t('transactions.transaction_receipt') || 'REÇU DE TRANSACTION' }}
              </p>
            </div>

            <!-- Transaction Info -->
            <div v-if="transaction" class="mb-4">
              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.reference') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <span class="badge bg-dark fs-6">{{ transaction.reference }}</span>
                </div>
              </div>

              <div v-if="transaction.withdrawal_code" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.withdrawal_code') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <span class="badge bg-primary fs-5">{{ transaction.withdrawal_code }}</span>
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.date') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ formatDateTime(transaction.created_at) }}
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.status') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <span :class="`badge bg-${getStatusColor(transaction.status)}`">
                    {{ getStatusLabel(transaction.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Transaction Details -->
            <div v-if="transaction" class="border-top border-bottom py-3 mb-3">
              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.transaction_type') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.transaction_type?.name }}
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.branch') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.branch?.name }}
                </div>
              </div>

              <div v-if="transaction.destination_branch" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.destination_branch') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.destination_branch.name }}
                </div>
              </div>

              <div v-if="transaction.customer" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.customer') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <div>{{ transaction.customer.full_name }}</div>
                  <div class="small text-muted">{{ transaction.customer.phone }}</div>
                </div>
              </div>

              <div v-else-if="transaction.customer_phone" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.phone') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.customer_phone }}
                </div>
              </div>

              <div v-if="transaction.dest_customer" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.dest_customer') || 'Bénéficiaire' }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <div>{{ transaction.dest_customer.full_name }}</div>
                  <div class="small text-muted">{{ transaction.dest_customer.phone }}</div>
                </div>
              </div>

              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.cashier') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ transaction.user?.name }}
                </div>
              </div>

              <div v-if="transaction.description" class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.description') || 'Note' }}:</strong>
                </div>
                <div class="col-6 text-end text-muted small" style="word-break:break-word">
                  {{ transaction.description }}
                </div>
              </div>
            </div>

            <!-- Amounts -->
            <div v-if="transaction" class="mb-4">
              <div class="row mb-2">
                <div class="col-6">
                  <strong>{{ t('transactions.gross_amount') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  {{ formatCurrency(transaction.gross_amount) }}
                </div>
              </div>

              <div class="row mb-2 text-danger">
                <div class="col-6">
                  <strong>{{ t('transactions.fee_amount') }}:</strong>
                </div>
                <div class="col-6 text-end">- {{ formatCurrency(transaction.fee_amount) }}</div>
              </div>

              <div class="row border-top pt-2">
                <div class="col-6">
                  <strong class="fs-5">{{ t('transactions.net_amount') }}:</strong>
                </div>
                <div class="col-6 text-end">
                  <strong class="fs-4 text-success">{{
                    formatCurrency(transaction.net_amount)
                  }}</strong>
                </div>
              </div>
            </div>

            <!-- Expiration Warning -->
            <div
              v-if="transaction?.expires_at && transaction.status === 'available'"
              class="alert alert-warning mb-3"
            >
              <i class="ti ti-alert-triangle me-2"></i>
              <strong>{{ t('transactions.expires_at') }}:</strong>
              {{ formatDateTime(transaction.expires_at) }}
            </div>

            <!-- Footer -->
            <div class="text-center mt-4 pt-3 border-top">
              <p class="small text-muted mb-1">
                {{ t('transactions.receipt_footer') || 'Merci pour votre confiance' }}
              </p>
              <p class="small text-muted mb-0">
                {{ t('transactions.keep_receipt') || 'Conservez ce reçu pour toute réclamation' }}
              </p>
            </div>

            <!-- Barcode/QR Code Placeholder -->
            <div class="text-center mt-3">
              <svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="barcode"
                    x="0"
                    y="0"
                    width="10"
                    height="50"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect
                      x="0"
                      y="0"
                      width="4"
                      height="50"
                      :fill="isDark ? '#e2e8f0' : '#1a1a2e'"
                    />
                    <rect x="4" y="0" width="6" height="50" fill="transparent" />
                  </pattern>
                </defs>
                <rect width="200" height="50" fill="url(#barcode)" />
              </svg>
              <div class="small text-muted mt-1">{{ transaction?.reference }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            <i class="ti ti-x me-2"></i>
            {{ t('transactions.close') || 'Fermer' }}
          </button>
          <button type="button" class="btn btn-info" @click="printReceipt">
            <i class="ti ti-printer me-2"></i>
            {{ t('transactions.print') || 'Imprimer' }}
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="downloadPDF"
            :disabled="downloading"
          >
            <span v-if="downloading" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="ti ti-download me-2"></i>
            {{ t('transactions.download_pdf') || 'Télécharger PDF' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useUserSettings } from '@/composables/useUserSettings'
import { axiosInstance } from '@/plugins/axios'
import { appConfig } from '@/config/app'
import type { Transaction } from '@/types'
import Swal from 'sweetalert2'

const { t } = useI18n()
const { settings } = useUserSettings()

// Locale dérivée du paramètre receiptLanguage (fr → fr-FR, en → en-US)
const receiptLocale = computed(() => {
  const lang = settings.value.transactions?.receiptLanguage || settings.value.language || 'fr'
  return lang === 'en' ? 'en-US' : 'fr-FR'
})

interface Props {
  show: boolean
  transaction: Transaction | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const downloading = ref(false)
const receiptContent = ref<HTMLElement | null>(null)

// Auto-impression si le paramètre autoPrintReceipt est activé
watch(() => props.show, (visible) => {
  if (visible && settings.value.transactions?.autoPrintReceipt) {
    // Délai court pour laisser le DOM se rendre avant d'imprimer
    setTimeout(() => printReceipt(), 400)
  }
})

// Detect current Bootstrap theme from <html data-bs-theme>
const isDark = computed(() => document.documentElement.getAttribute('data-bs-theme') === 'dark')

// Currency code: prefer relation > column > fallback
const currencyCode = computed(
  () => props.transaction?.currency?.code ?? props.transaction?.currency_code ?? 'XAF'
)

const closeModal = () => {
  emit('close')
}

const printReceipt = () => {
  if (!receiptContent.value || !props.transaction) return

  const tx = props.transaction
  const txCurrency = tx.currency?.code ?? tx.currency_code ?? 'XAF'
  const locale = receiptLocale.value
  const fmtNum = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: txCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(n)
    } catch {
      return (
        new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n) + ' ' + txCurrency
      )
    }
  }
  const fmtDate = (d: string) =>
    new Date(d).toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const statusColors: Record<string, string> = {
    pending: '#a16207',
    available: '#1d4ed8',
    completed: '#15803d',
    cancelled: '#4b5563',
    failed: '#b91c1c',
    expired: '#374151',
  }
  const statusBg: Record<string, string> = {
    pending: '#fef9c3',
    available: '#dbeafe',
    completed: '#dcfce7',
    cancelled: '#f3f4f6',
    failed: '#fee2e2',
    expired: '#e5e7eb',
  }
  const statusLabel: Record<string, string> = {
    pending: 'En attente',
    available: 'Disponible',
    completed: 'Complétée',
    cancelled: 'Annulée',
    failed: 'Échec',
    expired: 'Expirée',
  }
  const sColor = statusColors[tx.status] ?? '#374151'
  const sBg = statusBg[tx.status] ?? '#f3f4f6'
  const sLabel = statusLabel[tx.status] ?? tx.status

  const withdrawalRow = tx.withdrawal_code
    ? `<tr>
        <td class="label">Code de retrait</td>
        <td class="value"><span class="code-badge">${tx.withdrawal_code}</span></td>
       </tr>`
    : ''

  const destRow = tx.destination_branch
    ? `<tr><td class="label">Agence destination</td><td class="value">${tx.destination_branch.name}</td></tr>`
    : ''

  const destCustomerRow = tx.dest_customer
    ? `<tr>
        <td class="label">Bénéficiaire</td>
        <td class="value">${tx.dest_customer.full_name}<br>
          <span style="color:#6b7280;font-size:9px">${tx.dest_customer.phone ?? ''}</span>
        </td>
       </tr>`
    : ''

  const descriptionRow = tx.description
    ? `<tr>
        <td class="label">Note</td>
        <td class="value" style="font-weight:400;color:#555;font-size:9.5px;word-break:break-word">${tx.description}</td>
       </tr>`
    : ''

  const expiryRow =
    tx.expires_at && tx.status === 'available'
      ? `<div class="expiry-alert">⚠ Expire le ${fmtDate(tx.expires_at)}</div>`
      : ''

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Reçu — ${tx.reference}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    @media print { body { padding: 0; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: #111;
      background: #fff;
      padding: 14px 16px;
      max-width: 80mm;
    }

    /* Header */
    .brand {
      text-align: center;
      padding-bottom: 12px;
      border-bottom: 2px dashed #333;
      margin-bottom: 12px;
    }
    .brand-icon {
      display: inline-block;
      width: 36px; height: 36px;
      background: #1a1a2e;
      color: #fff;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 900;
      line-height: 36px;
      text-align: center;
      margin-bottom: 5px;
    }
    .brand-name { font-size: 16px; font-weight: 900; letter-spacing: 3px; }
    .brand-sub  { font-size: 8px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
    .doc-type   { font-size: 10px; font-weight: 700; letter-spacing: 2px; margin-top: 6px; text-transform: uppercase; }

    /* Info table */
    .section {
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px dashed #ccc;
    }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 3px 0; font-size: 10.5px; vertical-align: top; }
    td.label { color: #555; width: 45%; }
    td.value  { text-align: right; font-weight: 700; }

    /* Status badge */
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      background: ${sBg};
      color: ${sColor};
    }

    /* Withdrawal code */
    .code-badge {
      display: inline-block;
      background: #1a1a2e;
      color: #fff;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 13px;
      letter-spacing: 2px;
      font-weight: 900;
    }

    /* Amounts */
    .amounts { margin-bottom: 10px; }
    .amount-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 11px; }
    .amount-label { color: #555; }
    .amount-value { font-weight: 700; }
    .amount-gross { color: #1d4ed8; }
    .amount-fee   { color: #dc2626; }
    .divider { border: none; border-top: 1px solid #ccc; margin: 6px 0; }

    /* Net total */
    .net-total {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .net-total .nt-label { font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
    .net-total .nt-value { font-size: 16px; font-weight: 900; color: #15803d; }

    /* Expiry */
    .expiry-alert {
      background: #fef9c3;
      border: 1px dashed #a16207;
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 9.5px;
      color: #92400e;
      text-align: center;
      margin-bottom: 10px;
    }

    /* Barcode area */
    .barcode-area {
      text-align: center;
      margin: 10px 0;
      padding-top: 10px;
      border-top: 1px dashed #ccc;
    }
    .barcode-ref { font-size: 10px; letter-spacing: 2px; font-weight: 700; color: #374151; margin-top: 4px; }

    /* Footer */
    .footer {
      text-align: center;
      border-top: 2px dashed #333;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 8.5px;
      color: #6b7280;
      line-height: 1.6;
    }
  </style>
</head>
<body onload="window.print(); window.close();">

  <!-- Brand header -->
  <div class="brand">
    <div class="brand-icon">T</div>
    <div class="brand-name">TAMS</div>
    <div class="brand-sub">Transaction &amp; Asset Management</div>
    <div class="doc-type">Reçu de Transaction</div>
  </div>

  <!-- Info -->
  <div class="section">
    <table>
      <tr>
        <td class="label">Référence</td>
        <td class="value" style="letter-spacing:1px">${tx.reference}</td>
      </tr>
      ${withdrawalRow}
      <tr>
        <td class="label">Date</td>
        <td class="value">${fmtDate(tx.created_at)}</td>
      </tr>
      <tr>
        <td class="label">Statut</td>
        <td class="value"><span class="status-badge">${sLabel}</span></td>
      </tr>
    </table>
  </div>

  <!-- Details -->
  <div class="section">
    <table>
      <tr>
        <td class="label">Type</td>
        <td class="value">${tx.transaction_type?.name ?? '-'}</td>
      </tr>
      <tr>
        <td class="label">Agence</td>
        <td class="value">${tx.branch?.name ?? '-'}</td>
      </tr>
      ${destRow}
      ${
        tx.customer
          ? `<tr><td class="label">Client</td><td class="value">${
              tx.customer.full_name
            }<br><span style="color:#6b7280;font-size:9px">${
              tx.customer.phone ?? ''
            }</span></td></tr>`
          : tx.customer_phone
          ? `<tr><td class="label">Téléphone</td><td class="value">${tx.customer_phone}</td></tr>`
          : ''
      }
      ${destCustomerRow}
      <tr>
        <td class="label">Caissier</td>
        <td class="value">${tx.user?.name ?? '-'}</td>
      </tr>
      ${descriptionRow}
    </table>
  </div>

  <!-- Amounts -->
  <div class="amounts">
    <div class="amount-row">
      <span class="amount-label">Montant brut</span>
      <span class="amount-value amount-gross">${fmtNum(tx.gross_amount)}</span>
    </div>
    <div class="amount-row">
      <span class="amount-label">Frais</span>
      <span class="amount-value amount-fee">− ${fmtNum(tx.fee_amount)}</span>
    </div>
  </div>
  <div class="net-total">
    <span class="nt-label">Montant Net</span>
    <span class="nt-value">${fmtNum(tx.net_amount)}</span>
  </div>

  ${expiryRow}

  <!-- Barcode area -->
  <div class="barcode-area">
    <svg width="180" height="40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="bc" x="0" y="0" width="8" height="40" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="3" height="40" fill="#1a1a2e"/>
          <rect x="3" y="0" width="5" height="40" fill="white"/>
        </pattern>
      </defs>
      <rect width="180" height="40" fill="url(#bc)"/>
    </svg>
    <div class="barcode-ref">${tx.reference}</div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>Merci pour votre confiance</div>
    <div>Conservez ce reçu pour toute réclamation</div>
    <div style="margin-top:4px;letter-spacing:0.5px">TAMS © ${new Date().getFullYear()}</div>
  </div>

</body>
</html>`)
  printWindow.document.close()
}

const downloadPDF = async () => {
  if (!props.transaction) return

  downloading.value = true

  try {
    const response = await axiosInstance.get(
      `${appConfig.apiUrl}/transactions/${props.transaction.uuid}/receipt`,
      {
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipt-${props.transaction.reference}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: t('transactions.error') || 'Erreur',
      text:
        error.response?.data?.message ||
        t('transactions.error_downloading_receipt') ||
        'Erreur lors du téléchargement du reçu',
    })
  } finally {
    downloading.value = false
  }
}

const formatCurrency = (amount: number, code?: string) => {
  const currency = code ?? currencyCode.value
  const locale = receiptLocale.value
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return (
      new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount) + ' ' + currency
    )
  }
}

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString(receiptLocale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'warning',
    available: 'info',
    completed: 'success',
    cancelled: 'secondary',
    failed: 'danger',
    expired: 'dark',
  }
  return colors[status] || 'secondary'
}

const getStatusLabel = (status: string) => {
  return t(`transactions.status_${status}`) || status
}
</script>

<style scoped>
.modal.show {
  display: block;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.receipt-container {
  /* background: white; */
  border: 1px solid #dee2e6;
  border-radius: 8px;
  max-width: 600px;
  margin: 0 auto;
}

@media print {
  .modal-header,
  .modal-footer {
    display: none !important;
  }

  .receipt-container {
    border: none;
  }
}
</style>
