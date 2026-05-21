package com.sharefare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.ServerSocket;

@Component
public class PortCustomizer implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {
  private static final Logger log = LoggerFactory.getLogger(PortCustomizer.class);
  
  private final Environment environment;

  public PortCustomizer(Environment environment) {
    this.environment = environment;
  }

  @Override
  public void customize(ConfigurableWebServerFactory factory) {
    int port = environment.getProperty("server.port", Integer.class, 8080);
    if (port == 0) return; // Random port already requested
    
    if (System.getenv("RENDER") != null) {
      log.info("Running on Render. Bypassing PortCustomizer and binding strictly to server.port={}", port);
      return;
    }
    
    int originalPort = port;
    while (!isPortAvailable(port) && port < originalPort + 10) {
      log.warn("Port {} is already in use. Trying next port...", port);
      port++;
    }
    
    if (port != originalPort) {
      log.info("Original port {} occupied. Falling back to port {}.", originalPort, port);
      factory.setPort(port);
    }
  }

  private boolean isPortAvailable(int port) {
    try (ServerSocket serverSocket = new ServerSocket(port)) {
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
