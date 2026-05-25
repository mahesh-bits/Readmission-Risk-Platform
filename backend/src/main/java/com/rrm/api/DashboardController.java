package com.rrm.api;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4300", "http://localhost:3000"})
public class DashboardController {

  @PersistenceContext
  private EntityManager em;

  @GetMapping
  public DashboardStats get(@RequestParam(required = false) UUID providerId) {
    String providerFilter = providerId != null
        ? "AND admission_id IN (SELECT id FROM admissions WHERE provider_id = '" + providerId + "')"
        : "";

    DashboardStats stats = new DashboardStats();

    // ── Summary row ──────────────────────────────────────────────────────────
    Object[] row = (Object[]) em.createNativeQuery("""
        SELECT
          COUNT(*)                                                        AS total_admissions,
          COUNT(DISTINCT patient_id)                                      AS total_patients,
          COALESCE(SUM(CASE WHEN readmitted_30d THEN 1 ELSE 0 END), 0)   AS readmissions,
          ROUND(CAST(AVG(length_of_stay) AS numeric), 1)                  AS avg_los,
          ROUND(CAST(AVG(age)            AS numeric), 1)                  AS avg_age,
          SUM(CASE WHEN sex = 'M' THEN 1 ELSE 0 END)                     AS male_count,
          SUM(CASE WHEN sex = 'F' THEN 1 ELSE 0 END)                     AS female_count
        FROM mv_patient_admission_features
        WHERE 1=1 \s""" + providerFilter).getSingleResult();

    stats.totalAdmissions = toLong(row[0]);
    stats.totalPatients   = toLong(row[1]);
    stats.readmissions    = toLong(row[2]);
    stats.avgLos          = toDouble(row[3]);
    stats.avgAge          = toDouble(row[4]);
    stats.maleCount       = toLong(row[5]);
    stats.femaleCount     = toLong(row[6]);
    stats.readmissionRate = stats.totalAdmissions > 0
        ? Math.round((stats.readmissions * 1000.0 / stats.totalAdmissions)) / 10.0
        : 0.0;

    // ── Age buckets ──────────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    List<Object[]> ageRows = em.createNativeQuery("""
        SELECT
          CASE WHEN age < 40 THEN 'Under 40'
               WHEN age < 55 THEN '40–54'
               WHEN age < 70 THEN '55–69'
               ELSE '70+' END                                             AS age_group,
          COUNT(*)                                                        AS cnt,
          COALESCE(SUM(CASE WHEN readmitted_30d THEN 1 ELSE 0 END), 0)   AS readmissions
        FROM mv_patient_admission_features
        WHERE 1=1 \s""" + providerFilter + """

        GROUP BY age_group
        ORDER BY MIN(age)
        """).getResultList();

    stats.ageBuckets = ageRows.stream()
        .map(r -> new DashboardStats.AgeBucket((String) r[0], toLong(r[1]), toLong(r[2])))
        .toList();

    // ── Chronic condition distribution ────────────────────────────────────────
    @SuppressWarnings("unchecked")
    List<Object[]> condRows = em.createNativeQuery("""
        SELECT chronic_condition_count AS condition_count,
               COUNT(*)                    AS admissions
        FROM mv_patient_admission_features
        WHERE 1=1 \s""" + providerFilter + """

        GROUP BY chronic_condition_count
        ORDER BY chronic_condition_count
        """).getResultList();

    stats.conditionGroups = condRows.stream()
        .map(r -> new DashboardStats.ConditionGroup(((Number) r[0]).intValue(), toLong(r[1])))
        .toList();

    // ── Monthly trend (last 6 months) ─────────────────────────────────────────
    @SuppressWarnings("unchecked")
    List<Object[]> monthRows = em.createNativeQuery("""
        SELECT
          TO_CHAR(admit_ts, 'YYYY-MM')                                    AS month,
          COUNT(*)                                                        AS admissions,
          COALESCE(SUM(CASE WHEN readmitted_30d THEN 1 ELSE 0 END), 0)   AS readmissions
        FROM mv_patient_admission_features
        WHERE admit_ts >= now() - interval '6 months'
        \s""" + providerFilter + """

        GROUP BY TO_CHAR(admit_ts, 'YYYY-MM')
        ORDER BY month
        """).getResultList();

    stats.monthlyTrend = monthRows.stream()
        .map(r -> new DashboardStats.MonthlyTrend((String) r[0], toLong(r[1]), toLong(r[2])))
        .toList();

    // ── LOS distribution ─────────────────────────────────────────────────────
    @SuppressWarnings("unchecked")
    List<Object[]> losRows = em.createNativeQuery("""
        SELECT
          CASE WHEN length_of_stay <= 3  THEN '1–3 days'
               WHEN length_of_stay <= 7  THEN '4–7 days'
               WHEN length_of_stay <= 14 THEN '8–14 days'
               ELSE '15+ days' END       AS los_range,
          COUNT(*)                       AS cnt
        FROM mv_patient_admission_features
        WHERE 1=1 \s""" + providerFilter + """

        GROUP BY los_range
        ORDER BY MIN(length_of_stay)
        """).getResultList();

    stats.losBuckets = losRows.stream()
        .map(r -> new DashboardStats.LosBucket((String) r[0], toLong(r[1])))
        .toList();

    return stats;
  }

  private static long toLong(Object o) {
    return o == null ? 0L : ((Number) o).longValue();
  }

  private static double toDouble(Object o) {
    return o == null ? 0.0 : ((Number) o).doubleValue();
  }
}
