<template>
  <div class="row">
    <div class="col-12">
      <!-- Page Header -->
      <div class="d-flex align-items-sm-center flex-sm-row flex-column my-3 gap-3">
        <div class="flex-grow-1">
          <h4 class="fs-xl mb-1">
            {{ t('dashboard.title') || 'Tableau de bord' }}
            <span v-if="isAgent" class="badge bg-info-subtle text-info ms-2 fs-6 fw-normal align-middle">
              <i class="ti ti-user me-1"></i>{{ t('dashboard.my_data') || 'Mes données' }}
            </span>
          </h4>
          <p class="text-muted mb-0">
            {{ isAgent
              ? (t('dashboard.description_agent') || 'Vos transactions et votre agence')
              : (t('dashboard.description') || 'Vue globale du système de transfert') }}
          </p>
        </div>
        <div class="d-flex align-items-center gap-2 flex-wrap">
          <!-- Period Selector -->
          <select
            v-model="filters.period"
            @change="onPeriodChange"
            class="form-select form-select-sm"
            style="min-width: 170px"
          >
            <option value="today">{{ t('dashboard.period.today') || "Aujourd'hui" }}</option>
            <option value="yesterday">{{ t('dashboard.period.yesterday') || 'Hier' }}</option>
            <option value="week">{{ t('dashboard.period.week') || 'Cette semaine' }}</option>
            <option value="month">{{ t('dashboard.period.month') || 'Ce mois' }}</option>
            <option value="last_month">
              {{ t('dashboard.period.last_month') || 'Mois passé' }}
            </option>
            <option value="year">{{ t('dashboard.period.year') || 'Cette année' }}</option>
            <option value="all">{{ t('dashboard.period.all') || 'Tout' }}</option>
            <option value="custom">{{ t('dashboard.period.custom') || 'Personnalisé' }}</option>
          </select>
          <!-- Custom Date Range -->
          <template v-if="filters.period === 'custom'">
            <input
              type="date"
              v-model="filters.start_date"
              @change="debouncedLoadDashboard"
              class="form-control form-control-sm"
              style="max-width: 150px"
            />
            <span class="text-muted">—</span>
            <input
              type="date"
              v-model="filters.end_date"
              @change="debouncedLoadDashboard"
              class="form-control form-control-sm"
              style="max-width: 150px"
            />
          </template>
          <!-- Branch Filter — masqué pour l'agent (agence verrouillée) -->
          <template v-if="canFilterBranch">
            <select
              v-model="filters.branch_id"
              @change="debouncedLoadDashboard"
              class="form-select form-select-sm"
              style="min-width: 150px"
            >
              <option :value="null">
                {{ t('dashboard.filter.all_branches') || 'Toutes les agences' }}
              </option>
              <option v-for="b in branchStore.branch_list" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </template>
          <span v-else-if="isAgent" class="badge bg-secondary-subtle text-secondary py-2 px-3">
            <i class="ti ti-building-bank me-1"></i>
            {{ agentBranchName || t('dashboard.my_branch') || 'Mon agence' }}
          </span>
          <!-- Currency Filter -->
          <select
            v-model="filters.currency_id"
            @change="debouncedLoadDashboard"
            class="form-select form-select-sm"
            style="min-width: 120px"
          >
            <option :value="null">
              {{ t('dashboard.filter.all_currencies') || 'Toutes devises' }}
            </option>
            <option v-for="c in currencyStore.allCurrencies" :key="c.id" :value="c.id">
              {{ c.code }}
            </option>
          </select>
          <!-- Type Filter -->
          <select
            v-model="filters.transaction_type_id"
            @change="debouncedLoadDashboard"
            class="form-select form-select-sm"
            style="min-width: 150px"
          >
            <option :value="null">{{ t('dashboard.filter.all_types') || 'Tous les types' }}</option>
            <option v-for="tt in typeStore.transactionType_list" :key="tt.id" :value="tt.id">
              {{ tt.name }}
            </option>
          </select>
          <!-- Refresh -->
          <button
            @click="loadDashboard"
            class="btn btn-sm btn-outline-secondary"
            :disabled="store.loadingDashboard"
          >
            <i class="ti ti-refresh" :class="{ spin: store.loadingDashboard }"></i>
          </button>
        </div>
      </div>

      <!-- Active filters badge -->
      <div v-if="activeFilterCount > 0" class="mb-3 d-flex flex-wrap gap-2">
        <span class="badge bg-primary-subtle text-primary p-2">
          <i class="ti ti-filter me-1"></i>
          {{ activeFilterCount }} {{ t('dashboard.filters_active') || 'filtre(s) actif(s)' }}
        </span>
        <button @click="resetFilters" class="btn btn-xs btn-link text-muted p-0 ms-1">
          {{ t('dashboard.reset_filters') || 'Réinitialiser' }}
        </button>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- Loading Skeleton — mirrors every section of the dashboard          -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <template v-if="store.loadingDashboard">
        <!-- Skeleton Row 1 · 6 KPI cards -->
        <div class="row g-3 mb-4">
          <div v-for="i in 6" :key="'kpi-' + i" class="col-xl-2 col-lg-4 col-md-4 col-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3 placeholder-glow">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span class="placeholder rounded-3" style="width: 44px; height: 44px"></span>
                  <span class="placeholder col-4 rounded-pill"></span>
                </div>
                <span class="placeholder col-8 d-block mb-1" style="height: 1.8rem"></span>
                <span class="placeholder col-10"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton Row 2 · Donut chart + Area chart -->
        <div class="row g-3 mb-4">
          <!-- Donut -->
          <div class="col-xl-4 col-lg-5">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header py-3 border-bottom placeholder-glow">
                <span class="placeholder col-5"></span>
              </div>
              <div
                class="card-body d-flex flex-column align-items-center justify-content-center p-3 placeholder-glow gap-3"
              >
                <!-- Circle -->
                <span class="placeholder rounded-circle" style="width: 180px; height: 180px"></span>
                <!-- Legend rows -->
                <div class="d-flex flex-wrap justify-content-center gap-2 w-100">
                  <span
                    v-for="j in 6"
                    :key="'dl-' + j"
                    class="placeholder col-3 rounded-pill"
                    style="height: 0.65rem"
                  ></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Area chart -->
          <div class="col-xl-8 col-lg-7">
            <div class="card border-0 shadow-sm h-100">
              <div
                class="card-header py-3 border-bottom d-flex align-items-center justify-content-between placeholder-glow"
              >
                <span class="placeholder col-4"></span>
                <span class="placeholder col-2"></span>
              </div>
              <div class="card-body p-3 placeholder-glow d-flex flex-column gap-2">
                <!-- Y-axis + chart area mimic -->
                <div class="d-flex align-items-end gap-1 w-100" style="height: 260px">
                  <div class="d-flex flex-column justify-content-between pe-2" style="height: 100%">
                    <span
                      v-for="k in 5"
                      :key="'ya-' + k"
                      class="placeholder"
                      style="width: 28px; height: 0.55rem"
                    ></span>
                  </div>
                  <div class="flex-grow-1 h-100 d-flex flex-column justify-content-end gap-1">
                    <!-- Simulated area wave -->
                    <span class="placeholder w-100 rounded" style="height: 68%"></span>
                    <div class="d-flex justify-content-between">
                      <span
                        v-for="l in 8"
                        :key="'xa-' + l"
                        class="placeholder"
                        style="width: 28px; height: 0.55rem"
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton Row 3 · By-type + By-branch + Recent transactions -->
        <div class="row g-3 mb-4">
          <!-- By-type ranking -->
          <div class="col-xl-4 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header py-3 border-bottom placeholder-glow">
                <span class="placeholder col-5"></span>
              </div>
              <div class="card-body p-3 placeholder-glow d-flex flex-column gap-3">
                <div v-for="r in 5" :key="'tr-' + r" class="d-flex align-items-center gap-3">
                  <span
                    class="placeholder rounded-circle flex-shrink-0"
                    style="width: 28px; height: 28px"
                  ></span>
                  <div class="flex-grow-1 d-flex flex-column gap-1">
                    <div class="d-flex justify-content-between">
                      <span class="placeholder" :style="{ width: 55 - r * 5 + '%' }"></span>
                      <span class="placeholder" style="width: 24px"></span>
                    </div>
                    <span class="placeholder w-100 rounded" style="height: 4px"></span>
                  </div>
                  <span class="placeholder flex-shrink-0" style="width: 52px"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- By-branch ranking -->
          <div class="col-xl-4 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header py-3 border-bottom placeholder-glow">
                <span class="placeholder col-4"></span>
              </div>
              <div class="card-body p-3 placeholder-glow d-flex flex-column gap-3">
                <div v-for="r in 5" :key="'br-' + r" class="d-flex align-items-center gap-3">
                  <span
                    class="placeholder rounded-circle flex-shrink-0"
                    style="width: 28px; height: 28px"
                  ></span>
                  <div class="flex-grow-1 d-flex flex-column gap-1">
                    <div class="d-flex justify-content-between">
                      <span class="placeholder" :style="{ width: 60 - r * 6 + '%' }"></span>
                      <span class="placeholder" style="width: 24px"></span>
                    </div>
                    <span class="placeholder w-100 rounded" style="height: 4px"></span>
                  </div>
                  <span class="placeholder flex-shrink-0" style="width: 52px"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent transactions -->
          <div class="col-xl-4 col-lg-12">
            <div class="card border-0 shadow-sm h-100">
              <div
                class="card-header py-3 border-bottom d-flex align-items-center justify-content-between placeholder-glow"
              >
                <span class="placeholder col-5"></span>
                <span class="placeholder col-2"></span>
              </div>
              <div class="card-body p-0">
                <div
                  v-for="r in 8"
                  :key="'rx-' + r"
                  class="d-flex align-items-start gap-2 px-3 py-2 border-bottom placeholder-glow"
                >
                  <span
                    class="placeholder rounded-circle flex-shrink-0 mt-1"
                    style="width: 28px; height: 28px"
                  ></span>
                  <div class="flex-grow-1 d-flex flex-column gap-1">
                    <div class="d-flex justify-content-between">
                      <span class="placeholder" style="width: 45%"></span>
                      <span class="placeholder" style="width: 18%"></span>
                    </div>
                    <div class="d-flex gap-2">
                      <span class="placeholder rounded-pill" style="width: 14%"></span>
                      <span class="placeholder" style="width: 22%"></span>
                      <span class="placeholder ms-auto" style="width: 16%"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- ═══════════════════════════════════════════════════════════════════ -->

      <!-- KPI Overview Cards -->
      <div v-if="!store.loadingDashboard && data" class="row g-3 mb-4">
        <!-- Total Transactions -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-6">
          <div class="card border-0 shadow-sm kpi-card kpi-primary h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="kpi-icon-wrap bg-primary-subtle">
                  <i class="ti ti-arrows-exchange text-primary fs-4"></i>
                </span>
                <span class="badge bg-primary-subtle text-primary small">
                  {{ t('dashboard.total') || 'Total' }}
                </span>
              </div>
              <h3 class="kpi-value mb-1">{{ formatNumber(data.overview.total_transactions) }}</h3>
              <p class="kpi-label mb-0">
                {{ t('dashboard.total_transactions') || 'Transactions' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Total Amount -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-6">
          <div class="card border-0 shadow-sm kpi-card kpi-success h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="kpi-icon-wrap bg-success-subtle">
                  <i class="ti ti-cash text-success fs-4"></i>
                </span>
                <span class="badge bg-success-subtle text-success small">
                  {{ t('dashboard.gross') || 'Brut' }}
                </span>
              </div>
              <h3 class="kpi-value mb-1">{{ formatAmount(data.overview.total_amount) }}</h3>
              <p class="kpi-label mb-0">{{ t('dashboard.total_amount') || 'Montant total' }}</p>
            </div>
          </div>
        </div>

        <!-- Total Fees -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-6">
          <div class="card border-0 shadow-sm kpi-card kpi-warning h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="kpi-icon-wrap bg-warning-subtle">
                  <i class="ti ti-receipt-tax text-warning fs-4"></i>
                </span>
                <span class="badge bg-warning-subtle text-warning small">
                  {{ t('dashboard.fees') || 'Frais' }}
                </span>
              </div>
              <h3 class="kpi-value mb-1">{{ formatAmount(data.overview.total_fees) }}</h3>
              <p class="kpi-label mb-0">{{ t('dashboard.total_fees') || 'Total frais' }}</p>
            </div>
          </div>
        </div>

        <!-- Net Amount -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-6">
          <div class="card border-0 shadow-sm kpi-card kpi-info h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="kpi-icon-wrap bg-info-subtle">
                  <i class="ti ti-coin text-info fs-4"></i>
                </span>
                <span class="badge bg-info-subtle text-info small">
                  {{ t('dashboard.net') || 'Net' }}
                </span>
              </div>
              <h3 class="kpi-value mb-1">{{ formatAmount(data.overview.total_net) }}</h3>
              <p class="kpi-label mb-0">{{ t('dashboard.total_net') || 'Montant net' }}</p>
            </div>
          </div>
        </div>

        <!-- Average Amount -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-6">
          <div class="card border-0 shadow-sm kpi-card kpi-purple h-100">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="kpi-icon-wrap bg-purple-subtle">
                  <i class="ti ti-chart-line text-purple fs-4"></i>
                </span>
                <span class="badge bg-purple-subtle text-purple small">Moy</span>
              </div>
              <h3 class="kpi-value mb-1">{{ formatAmount(data.overview.average_amount) }}</h3>
              <p class="kpi-label mb-0">{{ t('dashboard.average_amount') || 'Montant moyen' }}</p>
            </div>
          </div>
        </div>

        <!-- Success Rate -->
        <div class="col-xl-2 col-lg-4 col-md-4 col-6">
          <div class="card border-0 shadow-sm kpi-card h-100" :class="successRateClass">
            <div class="card-body p-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="kpi-icon-wrap" :class="successRateIconBg">
                  <i class="ti ti-trophy fs-4" :class="successRateIconColor"></i>
                </span>
                <span class="badge small" :class="successRateBadge">
                  {{ t('dashboard.rate') || 'Taux' }}
                </span>
              </div>
              <h3 class="kpi-value mb-1">{{ data.overview.success_rate.toFixed(1) }}%</h3>
              <p class="kpi-label mb-0">{{ t('dashboard.success_rate') || 'Taux de succès' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Second Row: Status + Trend -->
      <div v-if="!store.loadingDashboard && data" class="row g-3 mb-4">
        <!-- Status Breakdown -->
        <div class="col-xl-4 col-lg-5">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header py-3 border-bottom">
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-chart-donut me-2 text-primary"></i>
                {{ t('dashboard.by_status') || 'Répartition par statut' }}
              </h5>
            </div>
            <div class="card-body p-2 d-flex align-items-center justify-content-center">
              <apexchart
                type="donut"
                height="300"
                width="100%"
                :options="statusChartOptions"
                :series="statusChartSeries"
              />
            </div>
          </div>
        </div>

        <!-- Trend Area Chart (ApexCharts) -->
        <div class="col-xl-8 col-lg-7">
          <div class="card border-0 shadow-sm h-100">
            <div
              class="card-header py-3 border-bottom d-flex align-items-center justify-content-between"
            >
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-chart-area me-2 text-success"></i>
                {{ t('dashboard.trend') || 'Évolution des transactions' }}
              </h5>
              <span class="text-muted small">{{ trendDateRange }}</span>
            </div>
            <div class="card-body p-2">
              <div v-if="data.trend.length === 0" class="text-center py-5 text-muted">
                <i class="ti ti-chart-area-line" style="font-size: 2.5rem; opacity: 0.5"></i>
                <p class="mt-2 mb-0">
                  {{ t('dashboard.no_trend_data') || 'Aucune donnée de tendance' }}
                </p>
              </div>
              <apexchart
                v-else
                type="area"
                height="300"
                width="100%"
                :options="trendChartOptions"
                :series="trendChartSeries"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Third Row: By Type + By Branch (admin/superviseur) + Recent -->
      <div v-if="!store.loadingDashboard && data" class="row g-3 mb-4">
        <!-- By Transaction Type -->
        <div :class="canSeeBranchRanking ? 'col-xl-4 col-lg-6' : 'col-xl-6 col-lg-6'">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header py-3 border-bottom">
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-category me-2 text-info"></i>
                {{ t('dashboard.by_type') || 'Par type de transaction' }}
              </h5>
            </div>
            <div class="card-body p-3">
              <div v-if="data.by_type.length === 0" class="text-center py-4 text-muted">
                <i class="ti ti-category" style="font-size: 2rem"></i>
                <p class="mt-2">{{ t('dashboard.no_data') || 'Aucune donnée' }}</p>
              </div>
              <div v-else class="d-flex flex-column gap-1">
                <div
                  v-for="(item, idx) in data.by_type"
                  :key="item.type_id"
                  class="ranking-row d-flex align-items-center gap-3"
                >
                  <div class="rank-badge rank-info">{{ idx + 1 }}</div>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="small fw-medium text-truncate">{{ item.type_name }}</span>
                      <span class="small text-muted ms-2 flex-shrink-0">{{ item.count }}</span>
                    </div>
                    <div class="progress" style="height: 4px">
                      <div
                        class="progress-bar bg-info"
                        :style="{ width: getTypePercent(item.count) + '%' }"
                      ></div>
                    </div>
                  </div>
                  <div class="text-end flex-shrink-0" style="min-width: 70px">
                    <small class="text-muted">{{ formatAmount(item.total_amount) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- By Branch — admin + superviseur uniquement -->
        <div v-if="canSeeBranchRanking" class="col-xl-4 col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header py-3 border-bottom">
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-building-bank me-2 text-warning"></i>
                {{ t('dashboard.by_branch') || 'Par agence' }}
              </h5>
            </div>
            <div class="card-body p-3">
              <div v-if="data.by_branch.length === 0" class="text-center py-4 text-muted">
                <i class="ti ti-building-bank" style="font-size: 2rem"></i>
                <p class="mt-2">{{ t('dashboard.no_data') || 'Aucune donnée' }}</p>
              </div>
              <div v-else class="d-flex flex-column gap-1">
                <div
                  v-for="(item, idx) in data.by_branch"
                  :key="item.branch_id"
                  class="ranking-row d-flex align-items-center gap-3"
                >
                  <div class="rank-badge rank-warning">{{ idx + 1 }}</div>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="small fw-medium text-truncate">{{ item.branch_name }}</span>
                      <span class="small text-muted ms-2 flex-shrink-0">{{ item.count }}</span>
                    </div>
                    <div class="progress" style="height: 4px">
                      <div
                        class="progress-bar bg-warning"
                        :style="{ width: getBranchPercent(item.count) + '%' }"
                      ></div>
                    </div>
                  </div>
                  <div class="text-end flex-shrink-0" style="min-width: 70px">
                    <small class="text-muted">{{ formatAmount(item.total_amount) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div :class="canSeeBranchRanking ? 'col-xl-4 col-lg-12' : 'col-xl-6 col-lg-12'">
          <div class="card border-0 shadow-sm h-100">
            <div
              class="card-header py-3 border-bottom d-flex align-items-center justify-content-between"
            >
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-history me-2 text-purple"></i>
                {{ t('dashboard.recent_transactions') || 'Transactions récentes' }}
              </h5>
              <router-link to="/transactions" class="recent-link small">
                {{ t('dashboard.view_all') || 'Voir tout' }} <i class="ti ti-arrow-right ms-1"></i>
              </router-link>
            </div>
            <div class="card-body p-0">
              <div v-if="data.recent_transactions.length === 0" class="text-center py-4 text-muted">
                <i class="ti ti-history" style="font-size: 2rem"></i>
                <p class="mt-2">{{ t('dashboard.no_recent') || 'Aucune transaction récente' }}</p>
              </div>
              <div v-else class="list-group list-group-flush">
                <div
                  v-for="tx in data.recent_transactions"
                  :key="tx.id"
                  class="list-group-item border-0 border-bottom px-3 py-2"
                >
                  <div class="d-flex align-items-start gap-2">
                    <div class="flex-shrink-0 mt-1">
                      <span
                        class="status-icon-round"
                        :class="`bg-${getStatusColor(tx.status)}-subtle`"
                      >
                        <i
                          class="ti"
                          :class="[getStatusIcon(tx.status), `text-${getStatusColor(tx.status)}`]"
                          style="font-size: 0.8rem"
                        ></i>
                      </span>
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                      <div class="d-flex align-items-center justify-content-between">
                        <span class="small fw-semibold text-truncate">{{ tx.reference }}</span>
                        <span class="small fw-semibold ms-2 flex-shrink-0">{{
                          formatAmount(tx.gross_amount)
                        }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2 mt-1">
                        <span
                          class="badge"
                          :class="`bg-${getStatusColor(tx.status)}-subtle text-${getStatusColor(
                            tx.status
                          )}`"
                          style="font-size: 0.65rem"
                        >
                          {{ tx.status_label || tx.status }}
                        </span>
                        <span class="text-muted" style="font-size: 0.7rem">{{
                          tx.transaction_type?.name || '—'
                        }}</span>
                        <span class="text-muted ms-auto" style="font-size: 0.65rem">{{
                          formatDate(tx.created_at)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- Rapport Par Wallet                                                -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-if="!store.loadingDashboard && data && data.by_wallet.length" class="row g-3 mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header py-3 border-bottom d-flex align-items-center justify-content-between">
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-wallet me-2 text-primary"></i>
                {{ isAgent
                  ? (t('dashboard.my_wallets_report') || 'Rapport de mes wallets')
                  : (t('dashboard.by_wallet') || 'Rapport par wallet') }}
              </h5>
              <span class="badge bg-secondary-subtle text-secondary">
                {{ data.by_wallet.length }} wallet(s)
              </span>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">{{ t('dashboard.wallet') || 'Wallet' }}</th>
                      <th>{{ t('dashboard.operator') || 'Opérateur' }}</th>
                      <th v-if="!isAgent">{{ t('dashboard.branch') || 'Agence' }}</th>
                      <th class="text-center">{{ t('dashboard.transactions_count') || 'Transactions' }}</th>
                      <th class="text-end">{{ t('dashboard.total_amount') || 'Montant total' }}</th>
                      <th class="text-end">{{ t('dashboard.total_fees') || 'Frais' }}</th>
                      <th class="text-end pe-3">{{ t('dashboard.total_net') || 'Net' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="w in data.by_wallet" :key="w.wallet_id">
                      <!-- Wallet number + progress bar -->
                      <td class="ps-3" style="min-width: 180px">
                        <div class="fw-medium small">{{ w.wallet_number }}</div>
                        <div class="progress mt-1" style="height: 3px">
                          <div
                            class="progress-bar bg-primary"
                            :style="{ width: getWalletPercent(w.total_amount) + '%' }"
                          ></div>
                        </div>
                      </td>
                      <!-- Operator -->
                      <td>
                        <span class="badge bg-primary-subtle text-primary small">
                          {{ w.operator_name }}
                        </span>
                        <div class="text-muted" style="font-size: 0.7rem">{{ w.currency_code }}</div>
                      </td>
                      <!-- Branch (hidden for agent) -->
                      <td v-if="!isAgent" class="small text-muted">{{ w.branch_name }}</td>
                      <!-- Count -->
                      <td class="text-center">
                        <span class="badge bg-light text-dark border fw-semibold">{{ formatNumber(w.count) }}</span>
                      </td>
                      <!-- Total amount -->
                      <td class="text-end fw-semibold text-success">
                        {{ formatBalanceAmount(w.total_amount, w.currency_symbol) }}
                      </td>
                      <!-- Fees -->
                      <td class="text-end text-warning small">
                        {{ formatBalanceAmount(w.total_fees, w.currency_symbol) }}
                      </td>
                      <!-- Net -->
                      <td class="text-end pe-3 fw-bold text-primary">
                        {{ formatBalanceAmount(w.total_amount - w.total_fees, w.currency_symbol) }}
                      </td>
                    </tr>
                  </tbody>
                  <!-- Totaux -->
                  <tfoot class="table-light fw-bold">
                    <tr>
                      <td class="ps-3" :colspan="isAgent ? 2 : 3">
                        <small class="text-muted">{{ t('dashboard.total') || 'Total' }}</small>
                      </td>
                      <td class="text-center">
                        <span class="badge bg-primary-subtle text-primary">
                          {{ formatNumber(data.by_wallet.reduce((s, w) => s + w.count, 0)) }}
                        </span>
                      </td>
                      <td class="text-end text-success">
                        {{ formatBalanceAmount(
                          data.by_wallet.reduce((s, w) => s + w.total_amount, 0),
                          data.by_wallet[0]?.currency_symbol
                        ) }}
                      </td>
                      <td class="text-end text-warning">
                        {{ formatBalanceAmount(
                          data.by_wallet.reduce((s, w) => s + w.total_fees, 0),
                          data.by_wallet[0]?.currency_symbol
                        ) }}
                      </td>
                      <td class="text-end pe-3 text-primary">
                        {{ formatBalanceAmount(
                          data.by_wallet.reduce((s, w) => s + w.total_amount - w.total_fees, 0),
                          data.by_wallet[0]?.currency_symbol
                        ) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- Balance Report Section                                            -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->

      <!-- Balance section header -->
      <div class="d-flex align-items-center justify-content-between my-3">
        <div>
          <h5 class="mb-1 fw-semibold">
            <i class="ti ti-scale me-2 text-primary"></i>
            {{ isAgent
              ? (t('dashboard.balance_report_agent') || 'Mes soldes')
              : (t('dashboard.balance_report') || 'Rapport des soldes') }}
          </h5>
          <p class="text-muted mb-0 small">
            {{ isAgent
              ? (t('dashboard.balance_report_agent_desc') || 'Soldes virtuels de vos wallets')
              : (t('dashboard.balance_report_desc') || 'Soldes cash par agence et soldes virtuels par wallet') }}
          </p>
        </div>
        <button
          @click="handleRefreshBalance"
          class="btn btn-sm btn-outline-secondary"
          :disabled="loadingBalances"
        >
          <i class="ti ti-refresh" :class="{ spin: loadingBalances }"></i>
        </button>
      </div>

      <!-- Balance Skeleton -->
      <template v-if="loadingBalances">
        <div class="row g-3 mb-3">
          <div v-for="i in 2" :key="'bs-' + i" class="col-md-6 col-xl-3">
            <div class="card border-0 shadow-sm placeholder-glow">
              <div class="card-body p-3">
                <span class="placeholder col-4 mb-2 d-block"></span>
                <span class="placeholder col-8 d-block mb-1" style="height: 1.5rem"></span>
                <span class="placeholder col-6"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="row g-3 mb-4">
          <div v-for="i in 2" :key="'bt-' + i" class="col-lg-6">
            <div class="card border-0 shadow-sm placeholder-glow">
              <div class="card-header py-3"><span class="placeholder col-5"></span></div>
              <div class="card-body p-0">
                <div v-for="j in 5" :key="j" class="d-flex gap-3 px-3 py-2 border-bottom">
                  <span class="placeholder col-3"></span>
                  <span class="placeholder col-2"></span>
                  <span class="placeholder col-3 ms-auto"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Totaux Système — admin + superviseur uniquement -->
      <div v-if="!loadingBalances && balanceReport?.summary.length && canSeeSystemTotals">
        <!-- Section header -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h5 class="mb-0 fw-semibold">
            <i class="ti ti-chart-pie me-2 text-primary"></i>
            {{ t('dashboard.system_totals') || 'Totaux Système' }}
          </h5>
          <span class="badge bg-light text-dark border">
            {{ t('dashboard.all_branches') || 'Toutes les branches' }}
          </span>
        </div>

        <div class="row g-3 mb-3">
          <div
            v-for="item in balanceReport.summary.filter(
              (s) => s.total_system_confirmed > 0 || s.total_system_pending !== 0
            )"
            :key="item.currency_code"
            class="col-md-6 col-xl-4"
          >
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-3">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span class="badge bg-primary-subtle text-primary fw-semibold fs-6">
                    {{ item.currency_code }}
                  </span>
                  <i class="ti ti-currency-dollar text-muted fs-5"></i>
                </div>

                <!-- Branch totals -->
                <div class="mb-3 pb-2 border-bottom">
                  <div class="text-muted small mb-1">
                    <i class="ti ti-building-bank me-1"></i>
                    {{ t('dashboard.total_branch_cash') || 'Cash agences' }}
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-muted">Confirmé:</span>
                    <span class="fw-semibold text-success">
                      {{ formatBalanceAmount(item.total_branch_confirmed, item.currency_symbol) }}
                    </span>
                  </div>
                  <div
                    v-if="item.total_branch_pending !== 0"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span class="small text-muted">En attente:</span>
                    <span
                      class="fw-semibold"
                      :class="item.total_branch_pending >= 0 ? 'text-info' : 'text-warning'"
                    >
                      {{ formatBalanceAmount(item.total_branch_pending, item.currency_symbol) }}
                    </span>
                  </div>
                  <div
                    class="d-flex justify-content-between align-items-center mt-1 pt-1 border-top"
                  >
                    <span class="small fw-medium">Projeté:</span>
                    <span class="fw-bold text-primary">
                      {{ formatBalanceAmount(item.total_branch_projected, item.currency_symbol) }}
                    </span>
                  </div>
                </div>

                <!-- Wallet totals -->
                <div class="mb-3 pb-2 border-bottom">
                  <div class="text-muted small mb-1">
                    <i class="ti ti-wallet me-1"></i>
                    {{ t('dashboard.total_wallet_virtual') || 'Virtuel wallets' }}
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-muted">Confirmé:</span>
                    <span class="fw-semibold text-info">
                      {{ formatBalanceAmount(item.total_wallet_confirmed, item.currency_symbol) }}
                    </span>
                  </div>
                  <div
                    v-if="item.total_wallet_pending !== 0"
                    class="d-flex justify-content-between align-items-center"
                  >
                    <span class="small text-muted">En attente:</span>
                    <span
                      class="fw-semibold"
                      :class="item.total_wallet_pending >= 0 ? 'text-info' : 'text-warning'"
                    >
                      {{ formatBalanceAmount(item.total_wallet_pending, item.currency_symbol) }}
                    </span>
                  </div>
                  <div
                    class="d-flex justify-content-between align-items-center mt-1 pt-1 border-top"
                  >
                    <span class="small fw-medium">Projeté:</span>
                    <span class="fw-bold text-primary">
                      {{ formatBalanceAmount(item.total_wallet_projected, item.currency_symbol) }}
                    </span>
                  </div>
                </div>

                <!-- System total (branches + wallets) -->
                <div class="bg-light rounded p-2">
                  <div
                    class="d-flex justify-content-between align-items-center"
                    :class="item.total_system_pending !== 0 ? 'mb-1' : 'mb-0'"
                  >
                    <span class="small fw-bold text-dark">
                      <i class="ti ti-sum me-1"></i>
                      Total Système:
                    </span>
                    <span class="fw-bold fs-5 text-dark">
                      {{ formatBalanceAmount(item.total_system_confirmed, item.currency_symbol) }}
                    </span>
                  </div>
                  <div
                    v-if="item.total_system_pending !== 0"
                    class="d-flex justify-content-between align-items-center mb-0"
                  >
                    <span class="small text-muted">Avec en attente:</span>
                    <span class="fw-bold text-success">
                      {{ formatBalanceAmount(item.total_system_projected, item.currency_symbol) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending transactions indicator -->
          <div v-if="balanceReport.pending_transactions_count > 0" class="col-12">
            <div class="alert alert-info d-flex align-items-center mb-0">
              <i class="ti ti-clock me-2"></i>
              <span>
                <strong>{{ balanceReport.pending_transactions_count }}</strong>
                {{
                  balanceReport.pending_transactions_count === 1
                    ? 'transaction en attente'
                    : 'transactions en attente'
                }}
                — Les montants projetés incluent l'impact de ces transactions.
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Branch + Wallet tables -->
      <div v-if="!loadingBalances && balanceReport" class="row g-3 mb-4">
        <!-- Soldes agences — admin + superviseur + caissier uniquement -->
        <div v-if="canSeeBranchBalances" class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div
              class="card-header py-3 border-bottom d-flex align-items-center justify-content-between"
            >
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-building-bank me-2 text-success"></i>
                {{ t('dashboard.branch_balances') || 'Soldes agences (Cash)' }}
              </h5>
              <span class="badge bg-secondary-subtle text-secondary">
                {{ balanceReport.branches.length }}
              </span>
            </div>
            <div class="card-body p-0">
              <div
                v-if="!balanceReport.branches.some((b) => b.balances.length)"
                class="text-center py-4 text-muted"
              >
                <i class="ti ti-building-bank" style="font-size: 2rem"></i>
                <p class="mt-2 small">
                  {{ t('dashboard.no_balance_data') || 'Aucun solde enregistré' }}
                </p>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">{{ t('dashboard.branch') || 'Agence' }}</th>
                      <th>{{ t('dashboard.currency') || 'Devise' }}</th>
                      <th class="text-end">{{ t('dashboard.confirmed') || 'Confirmé' }}</th>
                      <th class="text-end">{{ t('dashboard.pending') || 'En attente' }}</th>
                      <th class="text-end pe-3">{{ t('dashboard.projected') || 'Projeté' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="branch in balanceReport.branches" :key="branch.id">
                      <tr v-if="!branch.balances.length">
                        <td class="ps-3 text-muted small" colspan="5">
                          {{ branch.name }}
                          <span class="ms-2 text-muted fst-italic">— aucun solde</span>
                        </td>
                      </tr>
                      <tr
                        v-for="(bal, idx) in branch.balances"
                        :key="branch.id + '-' + bal.currency_code"
                      >
                        <td class="ps-3 small">
                          <span v-if="idx === 0" class="fw-medium">{{ branch.name }}</span>
                          <span v-else class="text-muted ms-3">↳</span>
                        </td>
                        <td>
                          <span class="badge bg-light text-dark border">{{
                            bal.currency_code
                          }}</span>
                        </td>
                        <td
                          class="text-end fw-semibold"
                          :class="bal.balance_confirmed > 0 ? 'text-success' : 'text-muted'"
                        >
                          {{ formatBalanceAmount(bal.balance_confirmed, bal.currency_symbol) }}
                        </td>
                        <td
                          class="text-end fw-semibold"
                          :class="
                            bal.balance_pending > 0
                              ? 'text-info'
                              : bal.balance_pending < 0
                              ? 'text-warning'
                              : 'text-muted'
                          "
                        >
                          {{ formatBalanceAmount(bal.balance_pending, bal.currency_symbol) }}
                        </td>
                        <td
                          class="text-end pe-3 fw-bold"
                          :class="bal.balance_projected > 0 ? 'text-primary' : 'text-muted'"
                        >
                          {{ formatBalanceAmount(bal.balance_projected, bal.currency_symbol) }}
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet balances -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div
              class="card-header py-3 border-bottom d-flex align-items-center justify-content-between"
            >
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-wallet me-2 text-info"></i>
                {{ t('dashboard.wallet_balances') || 'Soldes wallets (Virtuel)' }}
              </h5>
              <span class="badge bg-secondary-subtle text-secondary">
                {{ balanceReport.wallets.length }}
              </span>
            </div>
            <div class="card-body p-0">
              <div v-if="!balanceReport.wallets.length" class="text-center py-4 text-muted">
                <i class="ti ti-wallet" style="font-size: 2rem"></i>
                <p class="mt-2 small">{{ t('dashboard.no_wallets') || 'Aucun wallet' }}</p>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-3">{{ t('dashboard.wallet') || 'Numéro' }}</th>
                      <th>{{ t('dashboard.operator') || 'Opérateur' }}</th>
                      <th class="text-end">{{ t('dashboard.confirmed') || 'Confirmé' }}</th>
                      <th class="text-end">{{ t('dashboard.pending') || 'En attente' }}</th>
                      <th class="text-end pe-3">{{ t('dashboard.projected') || 'Projeté' }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="wallet in balanceReport.wallets" :key="wallet.id">
                      <td class="ps-3">
                        <div class="small fw-medium">{{ wallet.wallet_number }}</div>
                        <div class="text-muted" style="font-size: 0.7rem">
                          {{ wallet.branch_name }}
                        </div>
                      </td>
                      <td>
                        <span class="badge bg-primary-subtle text-primary small">
                          {{ wallet.operator_name || '—' }}
                        </span>
                        <div class="text-muted" style="font-size: 0.7rem">
                          {{ wallet.currency_code }}
                        </div>
                      </td>
                      <td class="text-end">
                        <div
                          class="fw-semibold"
                          :class="wallet.balance_confirmed > 0 ? 'text-success' : 'text-muted'"
                        >
                          {{
                            formatBalanceAmount(wallet.balance_confirmed, wallet.currency_symbol)
                          }}
                        </div>
                      </td>
                      <td class="text-end">
                        <div
                          class="fw-semibold"
                          :class="
                            wallet.balance_pending > 0
                              ? 'text-info'
                              : wallet.balance_pending < 0
                              ? 'text-warning'
                              : 'text-muted'
                          "
                        >
                          {{ formatBalanceAmount(wallet.balance_pending, wallet.currency_symbol) }}
                        </div>
                      </td>
                      <td class="text-end pe-3">
                        <div
                          class="fw-bold"
                          :class="wallet.balance_projected > 0 ? 'text-primary' : 'text-muted'"
                        >
                          {{
                            formatBalanceAmount(wallet.balance_projected, wallet.currency_symbol)
                          }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- Transactions en attente — section dédiée pour l'agent            -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-if="isAgent && !store.loadingDashboard && data && data.by_status.pending > 0" class="row g-3 mb-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm border-start border-warning border-3">
            <div class="card-header py-3 border-bottom d-flex align-items-center justify-content-between">
              <h5 class="card-title mb-0 fw-semibold">
                <i class="ti ti-clock-hour-4 me-2 text-warning"></i>
                {{ t('dashboard.pending_transactions') || 'Mes transactions en attente' }}
                <span class="badge bg-warning text-dark ms-2">{{ data.by_status.pending }}</span>
              </h5>
              <router-link to="/transactions" class="btn btn-sm btn-outline-warning">
                {{ t('dashboard.view_all') || 'Voir tout' }}
                <i class="ti ti-arrow-right ms-1"></i>
              </router-link>
            </div>
            <div class="card-body p-3">
              <div class="d-flex flex-wrap gap-3">
                <div v-for="tx in data.recent_transactions.filter(t => t.status === 'pending')" :key="tx.id"
                  class="d-flex align-items-center gap-2 p-2 rounded bg-warning-subtle flex-grow-1"
                  style="min-width: 260px"
                >
                  <span class="status-icon-round bg-warning-subtle flex-shrink-0">
                    <i class="ti ti-clock text-warning" style="font-size: 0.8rem"></i>
                  </span>
                  <div class="overflow-hidden">
                    <div class="small fw-semibold text-truncate">{{ tx.reference }}</div>
                    <div class="d-flex gap-2 align-items-center mt-1">
                      <span class="text-muted" style="font-size: 0.7rem">{{ tx.transaction_type?.name || '—' }}</span>
                      <span class="fw-semibold text-warning" style="font-size: 0.8rem">{{ formatAmount(tx.gross_amount) }}</span>
                    </div>
                  </div>
                </div>
                <div v-if="!data.recent_transactions.filter(t => t.status === 'pending').length" class="text-muted small">
                  <i class="ti ti-info-circle me-1"></i>
                  {{ t('dashboard.pending_not_in_recent') || 'Voir la liste complète des transactions.' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state (no data, not loading) -->
      <div v-if="!store.loadingDashboard && !data" class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center py-5">
              <i class="ti ti-dashboard text-muted" style="font-size: 3rem"></i>
              <h5 class="mt-3 text-muted">
                {{ t('dashboard.no_data_title') || 'Aucune donnée disponible' }}
              </h5>
              <p class="text-muted">
                {{
                  t('dashboard.no_data_desc') || 'Modifiez les filtres ou vérifiez la connexion.'
                }}
              </p>
              <button @click="loadDashboard" class="btn btn-primary mt-2">
                <i class="ti ti-refresh me-1"></i> {{ t('dashboard.retry') || 'Réessayer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Rapport Comptes Clients VIP ──────────────────────────────────── -->
    <CustomerAccountsReport v-if="can('lire_clients')" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useTransactionStore } from '@/stores/transactions'
import { useTransactionTypeStore } from '@/stores/transaction-types'
import { useBranchStore } from '@/stores/branches'
import { useCurrencyStore } from '@/stores/currencies'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from '@/composables/useI18n'
import { useBalanceReport } from '@/composables/useBalanceReport'
import { usePermissions } from '@/composables/usePermissions'
import CustomerAccountsReport from '@/components/CustomerAccounts/CustomerAccountsReport.vue'

import { echo } from '@/plugins/echo'
import type { DashboardFilters, DashboardStatistics } from '@/types'

const { t } = useI18n()
const authStore = useAuthStore()

useHead({ title: t('dashboard.title') || 'Tableau de bord' })

const {
  can,
  isAgent,
  canFilterBranch,
  canSeeBranchRanking,
  canSeeSystemTotals,
  canSeeBranchBalances,
} = usePermissions()
const store = useTransactionStore()
const typeStore = useTransactionTypeStore()
const branchStore = useBranchStore()
const currencyStore = useCurrencyStore()
const {
  report: balanceReport,
  loading: loadingBalances,
  fetchReport: _fetchBalanceReport,
} = useBalanceReport()

// Nom de l'agence de l'agent connecté (affiché à la place du filtre branche)
const agentBranchName = computed(() =>
  branchStore.branch_list.find(b => b.id === authStore.user?.branch_id)?.name ?? ''
)

// Passe branch_id pour les rapports de solde des agents (données de leur agence uniquement)
function fetchBalanceReport(silent = false) {
  const params =
    isAgent.value && authStore.user?.branch_id
      ? { branch_id: authStore.user.branch_id }
      : undefined
  return _fetchBalanceReport(silent, params)
}
const handleRefreshBalance = () => fetchBalanceReport()

// ── Filters ──────────────────────────────────────────────────────────────────
const filters = ref<DashboardFilters>({
  period: 'month',
  start_date: null,
  end_date: null,
  branch_id: null,
  currency_id: null,
  transaction_type_id: null,
})

const data = computed<DashboardStatistics | null>(() => store.dashboardStatistics)

// Active filter count (excluding period which always has a value)
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.branch_id) count++
  if (filters.value.currency_id) count++
  if (filters.value.transaction_type_id) count++
  if (filters.value.period === 'custom' && filters.value.start_date && filters.value.end_date)
    count++
  return count
})

// ── Date helpers ──────────────────────────────────────────────────────────────
function getDateRange(period: string): { start: string | null; end: string | null } {
  const now = new Date()
  const fmt = (d: Date): string => d.toISOString().split('T')[0]!

  switch (period) {
    case 'today':
      return { start: fmt(now), end: fmt(now) }
    case 'yesterday': {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      return { start: fmt(y), end: fmt(y) }
    }
    case 'week': {
      const day = now.getDay() || 7
      const mon = new Date(now)
      mon.setDate(now.getDate() - day + 1)
      return { start: fmt(mon), end: fmt(now) }
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: fmt(start), end: fmt(now) }
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: fmt(start), end: fmt(end) }
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1)
      return { start: fmt(start), end: fmt(now) }
    }
    case 'custom':
      return { start: filters.value.start_date, end: filters.value.end_date }
    default:
      return { start: null, end: null }
  }
}

function onPeriodChange() {
  if (filters.value.period !== 'custom') debouncedLoadDashboard()
}

function buildDashboardParams() {
  const { start, end } = getDateRange(filters.value.period)
  return {
    start_date: start ?? undefined,
    end_date: end ?? undefined,
    branch_id: filters.value.branch_id ?? undefined,
    currency_id: filters.value.currency_id ?? undefined,
    transaction_type_id: filters.value.transaction_type_id ?? undefined,
    user_id: isAgent.value ? (authStore.user?.id ?? undefined) : undefined,
  }
}

async function loadDashboard() {
  await store.fetchDashboardStatistics(buildDashboardParams())
}

// Silent version for real-time updates (no loader shown)
async function loadDashboardSilent() {
  try {
    await store.fetchDashboardStatistics(buildDashboardParams(), true)
  } catch (e) {
    console.warn('[realtime] dashboard silent refresh failed:', e)
  }
}

// Debounced wrapper — prevents burst API calls when filters change rapidly
let _debounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedLoadDashboard() {
  if (_debounceTimer) clearTimeout(_debounceTimer)
  _debounceTimer = setTimeout(() => loadDashboard(), 300)
}
onUnmounted(() => {
  if (_debounceTimer) clearTimeout(_debounceTimer)
})

function resetFilters() {
  filters.value = {
    period: 'month',
    start_date: null,
    end_date: null,
    branch_id: null,
    currency_id: null,
    transaction_type_id: null,
  }
  loadDashboard()
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatNumber(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function formatAmount(n: number) {
  if (!n && n !== 0) return '—'
  const defaultCurrency = currencyStore.defaultCurrency
  if (defaultCurrency && filters.value.currency_id === null) {
    return currencyStore.formatAmount(n, defaultCurrency.code)
  }
  if (filters.value.currency_id) {
    const c = currencyStore.allCurrencies.find((x) => x.id === filters.value.currency_id)
    if (c) return currencyStore.formatAmount(n, c.code)
  }
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  pending: '#f0ad4e',
  available: '#0dcaf0',
  completed: '#198754',
  cancelled: '#6c757d',
  failed: '#dc3545',
  expired: '#4a4a5a',
}

const statusItems = [
  {
    key: 'pending' as const,
    label: t('transactions.pending') || 'En attente',
    color: STATUS_COLORS.pending,
  },
  {
    key: 'available' as const,
    label: t('transactions.available') || 'Disponible',
    color: STATUS_COLORS.available,
  },
  {
    key: 'completed' as const,
    label: t('transactions.completed') || 'Complétée',
    color: STATUS_COLORS.completed,
  },
  {
    key: 'cancelled' as const,
    label: t('transactions.cancelled') || 'Annulée',
    color: STATUS_COLORS.cancelled,
  },
  {
    key: 'failed' as const,
    label: t('transactions.failed') || 'Échouée',
    color: STATUS_COLORS.failed,
  },
  {
    key: 'expired' as const,
    label: t('transactions.expired') || 'Expirée',
    color: STATUS_COLORS.expired,
  },
]

function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'warning',
    available: 'info',
    completed: 'success',
    cancelled: 'secondary',
    failed: 'danger',
    expired: 'dark',
  }
  return map[status] || 'secondary'
}

function getStatusIcon(status: string): string {
  const map: Record<string, string> = {
    pending: 'ti-clock',
    available: 'ti-check',
    completed: 'ti-circle-check',
    cancelled: 'ti-x',
    failed: 'ti-alert-circle',
    expired: 'ti-clock-hour-4',
  }
  return map[status] || 'ti-question-mark'
}

// Success rate KPI
const successRateIconBg = computed(() => {
  const r = data.value?.overview.success_rate ?? 0
  return r >= 80 ? 'bg-success-subtle' : r >= 50 ? 'bg-warning-subtle' : 'bg-danger-subtle'
})
const successRateIconColor = computed(() => {
  const r = data.value?.overview.success_rate ?? 0
  return r >= 80 ? 'text-success' : r >= 50 ? 'text-warning' : 'text-danger'
})
const successRateBadge = computed(() => {
  const r = data.value?.overview.success_rate ?? 0
  return r >= 80
    ? 'bg-success-subtle text-success'
    : r >= 50
    ? 'bg-warning-subtle text-warning'
    : 'bg-danger-subtle text-danger'
})
const successRateClass = computed(() => {
  const r = data.value?.overview.success_rate ?? 0
  return r >= 80 ? 'border-success' : r >= 50 ? 'border-warning' : 'border-danger'
})

// ── Type / Branch rank percent ────────────────────────────────────────────────
function getTypePercent(count: number) {
  if (!data.value?.by_type.length) return 0
  const max = Math.max(...data.value.by_type.map((i) => i.count))
  return max ? Math.round((count / max) * 100) : 0
}

function getBranchPercent(count: number) {
  if (!data.value?.by_branch.length) return 0
  const max = Math.max(...data.value.by_branch.map((i) => i.count))
  return max ? Math.round((count / max) * 100) : 0
}

function getWalletPercent(amount: number) {
  if (!data.value?.by_wallet.length) return 0
  const max = Math.max(...data.value.by_wallet.map((w: { total_amount: number }) => w.total_amount))
  return max ? Math.round((amount / max) * 100) : 0
}

// ── ApexCharts: Status Donut ──────────────────────────────────────────────────
const statusChartSeries = computed(() => {
  if (!data.value) return statusItems.map(() => 0)
  return statusItems.map((s) => data.value!.by_status[s.key] || 0)
})

const statusChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    background: 'transparent',
    foreColor: '#a0aab4',
    fontFamily: 'inherit',
  },
  labels: statusItems.map((s) => s.label),
  colors: statusItems.map((s) => s.color),
  legend: {
    position: 'bottom' as const,
    fontSize: '12px',
    fontFamily: 'inherit',
    labels: { colors: '#a0aab4' },
    itemMargin: { horizontal: 8, vertical: 4 },
  },
  plotOptions: {
    pie: {
      donut: {
        size: '62%',
        labels: {
          show: true,
          total: {
            show: true,
            showAlways: true,
            label: t('dashboard.total') || 'Total',
            fontSize: '13px',
            fontFamily: 'inherit',
            color: '#a0aab4',
            formatter: () => String(data.value?.overview.total_transactions ?? 0),
          },
          value: {
            fontSize: '22px',
            fontFamily: 'inherit',
            fontWeight: 700,
            color: '#e2e5ec',
          },
          name: {
            fontSize: '12px',
            fontFamily: 'inherit',
            color: '#a0aab4',
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} transaction${val > 1 ? 's' : ''}`,
    },
  },
}))

// ── ApexCharts: Trend Area (one series per currency) ─────────────────────────
const TREND_PALETTE = ['#198754', '#0dcaf0', '#f0ad4e', '#6f42c1', '#dc3545', '#fd7e14']

/** All unique sorted dates across all currencies */
const trendDates = computed<string[]>(() => {
  if (!data.value?.trend.length) return []
  const dates: string[] = data.value.trend.map((i) => i.date)
  return Array.from(new Set(dates)).sort()
})

/** All unique currency codes present in trend data */
const trendCurrencies = computed<string[]>(() => {
  if (!data.value?.trend.length) return []
  return Array.from(new Set(data.value.trend.map((i) => i.currency_code)))
})

const trendChartSeries = computed(() => {
  if (!data.value?.trend.length) return []
  // Index: date -> currency_code -> amount
  const index = new Map<string, Map<string, number>>()
  for (const item of data.value.trend) {
    if (!index.has(item.date)) index.set(item.date, new Map())
    index.get(item.date)!.set(item.currency_code, Number(item.total_amount))
  }
  return trendCurrencies.value.map((code) => ({
    name: code,
    data: trendDates.value.map((d) => index.get(d)?.get(code) ?? 0),
  }))
})

function formatAxisDate(d: string) {
  const dt = new Date(d)
  return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`
}

const trendChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#a0aab4',
    fontFamily: 'inherit',
    zoom: { enabled: false },
    animations: { enabled: true, speed: 600 },
  },
  stroke: { curve: 'smooth' as const, width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.25,
      opacityTo: 0.02,
      stops: [0, 95, 100],
    },
  },
  colors: TREND_PALETTE.slice(0, Math.max(trendCurrencies.value.length, 1)),
  xaxis: {
    categories: trendDates.value.map(formatAxisDate),
    labels: {
      style: { fontSize: '11px', fontFamily: 'inherit', colors: '#a0aab4' },
      rotate: -30,
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => {
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`
        return String(Math.round(val))
      },
      style: { fontSize: '10px', fontFamily: 'inherit', colors: '#a0aab4' },
    },
  },
  tooltip: {
    shared: true,
    intersect: false,
    theme: 'dark',
    y: {
      formatter: (val: number, opts: { seriesIndex: number }) => {
        const code = trendCurrencies.value[opts.seriesIndex] ?? ''
        return `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val)} ${code}`
      },
    },
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    fontSize: '12px',
    fontFamily: 'inherit',
    labels: { colors: '#a0aab4' },
    itemMargin: { horizontal: 10 },
  },
  grid: {
    borderColor: 'rgba(255,255,255,0.07)',
    strokeDashArray: 3,
    padding: { left: 8, right: 8, top: 0, bottom: 0 },
  },
  dataLabels: { enabled: false },
  markers: { size: 0, hover: { size: 5 } },
}))

const trendDateRange = computed(() => {
  if (!trendDates.value.length) return ''
  const first = formatAxisDate(trendDates.value[0]!)
  const last = formatAxisDate(trendDates.value[trendDates.value.length - 1]!)
  return first === last ? first : `${first} → ${last}`
})

// ── onMounted ─────────────────────────────────────────────────────────────────
function formatBalanceAmount(n: number, symbol?: string | null) {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
  return symbol ? `${formatted} ${symbol}` : formatted
}

// ── Real-time updates ─────────────────────────────────────────────────────────
let echoChannel: ReturnType<typeof echo.private> | null = null

onMounted(async () => {
  // Verrouiller l'agence pour les agents (ils ne voient que leurs données)
  if (isAgent.value && authStore.user?.branch_id) {
    filters.value.branch_id = authStore.user.branch_id
  }

  await Promise.all([
    branchStore.fetchBranches(1, undefined, 100),
    currencyStore.fetchAllCurrencies(),
    typeStore.fetchTransactionTypes(),
    loadDashboard(),
    fetchBalanceReport(),
  ])

  // Listen for balance update notifications in real-time
  const userId = authStore.user?.id
  if (userId) {
    echoChannel = echo.private(`App.Models.User.${userId}`)

    echoChannel.notification((payload: Record<string, unknown>) => {
      const notifType = payload.notification_type as string

      const isBalanceEvent =
        notifType === 'branch_balance_updated' || notifType === 'wallet_balance_updated'
      const isTransactionEvent =
        notifType === 'transaction_created' ||
        notifType === 'transaction_completed' ||
        notifType === 'transaction_cancelled' ||
        notifType === 'transaction_available' ||
        notifType === 'transaction_failed' ||
        notifType === 'transaction_expired'

      if (isBalanceEvent || isTransactionEvent) {
        // Always refresh both: KPI stats + balance report
        loadDashboardSilent()
        fetchBalanceReport(true)
      }
    })
  }
})

onUnmounted(() => {
  if (echoChannel) {
    echoChannel.stopListening('.notification')
    echoChannel = null
  }
})
</script>

<style scoped>
/* ── KPI Cards ─────────────────────────────────────────────────────────────── */
.kpi-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
}
.kpi-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
}
.kpi-label {
  font-size: 0.72rem;
  color: var(--vz-secondary-color, #8b95a1);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ── Purple helpers ────────────────────────────────────────────────────────── */
.bg-purple-subtle {
  background-color: rgba(110, 66, 193, 0.15) !important;
}
.text-purple {
  color: #8a56e2 !important;
}

/* ── Ranking rows ──────────────────────────────────────────────────────────── */
.ranking-row {
  padding: 0.4rem 0;
}
.ranking-row + .ranking-row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.rank-info {
  background: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
}
.rank-warning {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

/* ── Recent transactions ───────────────────────────────────────────────────── */
.status-icon-round {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.list-group-item:last-child {
  border-bottom: none !important;
}

.recent-link {
  color: var(--vz-secondary-color, #8b95a1);
  text-decoration: none;
}
.recent-link:hover {
  color: var(--vz-primary, #0d6efd);
}

/* ── Spin animation ────────────────────────────────────────────────────────── */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.spin {
  animation: spin 1s linear infinite;
  display: inline-block;
}
</style>