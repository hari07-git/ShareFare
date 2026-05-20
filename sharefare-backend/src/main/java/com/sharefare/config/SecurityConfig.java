package com.sharefare.config;

import com.sharefare.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.nio.charset.StandardCharsets;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  private final JwtAuthFilter jwtAuthFilter;
  private final com.sharefare.security.AppUserDetailsService userDetailsService;

  public SecurityConfig(JwtAuthFilter jwtAuthFilter, com.sharefare.security.AppUserDetailsService userDetailsService) {
    this.jwtAuthFilter = jwtAuthFilter;
    this.userDetailsService = userDetailsService;
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(PasswordEncoder encoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(userDetailsService);
    provider.setPasswordEncoder(encoder);
    return new ProviderManager(provider);
  }

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .cors(cors -> {})
        .csrf(csrf -> csrf.disable())
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(eh -> eh
            .authenticationEntryPoint((req, res, ex) -> {
              res.setStatus(401);
              res.setContentType("application/json");
              res.setCharacterEncoding(StandardCharsets.UTF_8.name());
              res.getWriter().write("{\"message\":\"Unauthorized\"}");
            })
            .accessDeniedHandler((req, res, ex) -> {
              res.setStatus(403);
              res.setContentType("application/json");
              res.setCharacterEncoding(StandardCharsets.UTF_8.name());
              res.getWriter().write("{\"message\":\"Forbidden\"}");
            })
        )
        .authorizeHttpRequests(registry -> registry
            .requestMatchers("/api/auth/**", "/api/debug/mail", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/uploads/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/rides/**").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}
