package com.rrm.api;

import java.util.List;

public class DashboardStats {

  public long totalAdmissions;
  public long totalPatients;
  public long readmissions;
  public double readmissionRate;
  public double avgLos;
  public double avgAge;
  public long maleCount;
  public long femaleCount;

  public List<AgeBucket>      ageBuckets;
  public List<ConditionGroup> conditionGroups;
  public List<MonthlyTrend>   monthlyTrend;
  public List<LosBucket>      losBuckets;

  public record AgeBucket(String ageGroup, long count, long readmissions) {}
  public record ConditionGroup(int conditionCount, long admissions) {}
  public record MonthlyTrend(String month, long admissions, long readmissions) {}
  public record LosBucket(String losRange, long count) {}
}
