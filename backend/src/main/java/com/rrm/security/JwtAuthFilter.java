package com.rrm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import io.jsonwebtoken.*;

import java.io.IOException;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class JwtAuthFilter extends OncePerRequestFilter {

  private final PublicKey publicKey;

  public JwtAuthFilter(ResourceLoader resourceLoader, String publicKeyLocation) {
    this.publicKey = loadPublicKey(resourceLoader, publicKeyLocation);
  }

  @Override
  protected void doFilterInternal(
          HttpServletRequest req,
          HttpServletResponse res,
          FilterChain chain
  ) throws ServletException, IOException {

    String auth = req.getHeader("Authorization");

    if (StringUtils.hasText(auth) && auth.startsWith("Bearer ")) {
      String token = auth.substring(7);
      try {
        Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(token);
      } catch (JwtException e) {
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
        return;
      }
    }

    chain.doFilter(req, res);
  }

  private static PublicKey loadPublicKey(ResourceLoader loader, String location) {
    try {
      Resource resource = loader.getResource(location);

      if (!resource.exists()) {
        throw new IllegalStateException("Public key not found at " + location);
      }

      String pem = new String(resource.getInputStream().readAllBytes())
              .replace("-----BEGIN PUBLIC KEY-----", "")
              .replace("-----END PUBLIC KEY-----", "")
              .replaceAll("\\s", "");

      byte[] der = Base64.getDecoder().decode(pem);
      X509EncodedKeySpec spec = new X509EncodedKeySpec(der);

      return KeyFactory.getInstance("RSA").generatePublic(spec);

    } catch (Exception ex) {
      throw new RuntimeException("Failed to load public key from " + location, ex);
    }
  }
}