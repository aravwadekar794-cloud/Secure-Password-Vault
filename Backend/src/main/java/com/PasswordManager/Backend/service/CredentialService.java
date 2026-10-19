package com.PasswordManager.Backend.service;

import com.PasswordManager.Backend.model.Credential;
import com.PasswordManager.Backend.model.User;
import com.PasswordManager.Backend.repository.CredentialRepository;
import com.PasswordManager.Backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final UserRepository userRepository;

    public CredentialService(CredentialRepository credentialRepository, UserRepository userRepository) {
        this.credentialRepository = credentialRepository;
        this.userRepository = userRepository;
    }

    public Credential addCredential(Credential credential, String username) {
        User user = getUserOrThrow(username);
        Optional<Credential> dup = credentialRepository.findByUserAndServiceName(user, credential.getServiceName());
        if (dup.isPresent())
            throw new RuntimeException("Credential already exists for this site.");

        credential.setUser(user);
        // removed: credential.setPswdStrength(...)
        return credentialRepository.save(credential);
    }

    @Transactional
    public Credential changeCredential(Credential req, String username) {
        Credential credential = credentialRepository.findById(req.getId())
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        if (!credential.getUser().getUsername().equals(username))
            throw new RuntimeException("Unauthorized: You can only update your own credentials");

        credential.setServiceName(req.getServiceName());
        credential.setUsername(req.getUsername());
        credential.setPassword(req.getPassword());
        // removed: credential.setPswdStrength(...)
        return credential;
    }

    public List<Credential> getUserCredentials(String username) {
        return credentialRepository.findByUser(getUserOrThrow(username));
    }

    public void deleteCredential(Long credentialId, String username) {
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        if (!credential.getUser().getUsername().equals(username))
            throw new RuntimeException("Unauthorized: You can only delete your own credentials");
        credentialRepository.delete(credential);
    }

    private User getUserOrThrow(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
