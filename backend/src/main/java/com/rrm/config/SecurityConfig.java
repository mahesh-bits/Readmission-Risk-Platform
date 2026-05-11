package com.rrm.config;

import com.rrm.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

  private final ResourceLoader resourceLoader;

  public SecurityConfig(ResourceLoader resourceLoader) {
    this.resourceLoader = resourceLoader;
  }

  @Value("${jwt.public-key}")
  private String publicKeyLocation;

  @Value("${jwt.enabled:true}")
  private boolean jwtEnabled;

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

    http
            .csrf(AbstractHttpConfigurer::disable);

    // ✅ Allow disabling JWT entirely (very useful for dev / smoke tests)
    if (!jwtEnabled) {
      http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
      return http.build();
    }

    JwtAuthFilter jwtFilter =
            new JwtAuthFilter(resourceLoader, publicKeyLocation);

    http
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(
                            "/actuator/**",
                            "/api/inference/**"
                    ).permitAll()
                    .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}