package pe.empresa.gestorcontactos.entitys;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contactos", indexes = {
        @Index(name = "idx_contactos_dni_estado", columnList = "dni, estado"),
        @Index(name = "idx_contactos_apellidos_nombres", columnList = "apellidos, nombres")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contacto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Pattern(regexp = "\\d{8}")
    @Column(nullable = false, length = 8)
    private String dni;

    @NotBlank
    @Column(nullable = false)
    private String nombres;

    @NotBlank
    @Column(nullable = false)
    private String apellidos;

    @NotBlank
    @Column(name = "photo_path", nullable = false, length = 500)
    private String photoPath;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoContacto estado = EstadoContacto.ACTIVO;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private Usuario createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by_id")
    private Usuario updatedBy;

    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "contacto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TelefonoContacto> telefonos = new ArrayList<>();

    @OneToMany(mappedBy = "contacto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CorreoContacto> correos = new ArrayList<>();

    public Contacto(String dni, String nombres, String apellidos, String photoPath, Usuario createdBy) {
        this.dni = dni;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.photoPath = photoPath;
        this.createdBy = createdBy;
        this.estado = EstadoContacto.ACTIVO;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public void agregarTelefono(TelefonoContacto telefono) {
        telefonos.add(telefono);
        telefono.setContacto(this);
    }

    public void agregarCorreo(CorreoContacto correo) {
        correos.add(correo);
        correo.setContacto(this);
    }

    public void actualizarDatos(String dni, String nombres, String apellidos, String photoPath, Usuario updatedBy) {
        this.dni = dni;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.photoPath = photoPath;
        this.updatedBy = updatedBy;
    }

    public void desactivar() { this.estado = EstadoContacto.INACTIVO; }
    public void reactivar() { this.estado = EstadoContacto.ACTIVO; }

}
