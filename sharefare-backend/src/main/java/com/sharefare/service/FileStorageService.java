package com.sharefare.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

  private final Path storageLocation;

  public FileStorageService(@Value("${sharefare.storage.dir:uploads/student-ids}") String uploadDir) throws IOException {
    this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(this.storageLocation);
  }

  public String storeFile(MultipartFile file, String prefix) {
    if (file.isEmpty()) {
      throw new RuntimeException("Failed to store empty file.");
    }
    String extension = getExtension(file.getOriginalFilename());
    String filename = prefix + "_" + UUID.randomUUID().toString() + extension;
    try {
      Path targetLocation = this.storageLocation.resolve(filename);
      Files.copy(file.getInputStream(), targetLocation);
      return filename;
    } catch (IOException ex) {
      throw new RuntimeException("Could not store file " + filename + ". Please try again!", ex);
    }
  }

  private String getExtension(String filename) {
    if (filename == null || !filename.contains(".")) {
      return ".jpg";
    }
    return filename.substring(filename.lastIndexOf("."));
  }

  public byte[] getFileContent(String filename) {
    try {
      Path filePath = this.storageLocation.resolve(filename).normalize();
      return Files.readAllBytes(filePath);
    } catch (IOException ex) {
      throw new RuntimeException("Could not read file " + filename, ex);
    }
  }
}
