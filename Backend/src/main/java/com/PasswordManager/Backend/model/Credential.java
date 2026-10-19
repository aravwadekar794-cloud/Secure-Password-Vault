package com.PasswordManager.Backend.model;

import com.PasswordManager.Backend.util.PwdStrengthUtil;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class Credential extends Audit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private String username;
    private String password;

    @Transient
    @JsonProperty("pswdStrength")
    public List<String> getPswdStrength() {
        return PwdStrengthUtil.analyze(password);
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;
}
