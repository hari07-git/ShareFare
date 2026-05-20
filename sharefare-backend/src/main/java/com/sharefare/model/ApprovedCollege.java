package com.sharefare.model;

import jakarta.persistence.*;

@Entity
@Table(name = "approved_colleges")
public class ApprovedCollege {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 255)
  private String collegeName;

  @Column(length = 100)
  private String city;

  @Column(nullable = false, columnDefinition = "boolean default true")
  private boolean active = true;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getCollegeName() { return collegeName; }
  public void setCollegeName(String collegeName) { this.collegeName = collegeName; }
  public String getCity() { return city; }
  public void setCity(String city) { this.city = city; }
  public boolean isActive() { return active; }
  public void setActive(boolean active) { this.active = active; }
}
