package pe.empresa.gestorcontactos.entitys;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.Check;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "auditoria")
@Check(constraints = "(contacto_afectado_id IS NOT NULL AND usuario_afectado_id IS NULL) " +
        "OR (contacto_afectado_id IS NULL AND usuario_afectado_id IS NOT NULL)")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RegistroAuditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccionAuditoria accion;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_ejecutor_id", nullable = false)
    private Usuario usuarioEjecutor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contacto_afectado_id")
    private Contacto contactoAfectado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_afectado_id")
    private Usuario usuarioAfectado;

    @Column(columnDefinition = "TEXT")
    private String detalle;

    @NotNull
    @Column(name = "event_timestamp", nullable = false, updatable = false)
    private Instant timestamp;

    public RegistroAuditoria(
            Contacto contactoAfectado,
            Usuario usuarioAfectado,
            AccionAuditoria accion,
            Usuario usuarioEjecutor,
            String detalle) {
        if ((contactoAfectado == null) == (usuarioAfectado == null)) {
            throw new IllegalArgumentException("La auditoría debe referenciar un contacto o un usuario afectado.");
        }
        this.contactoAfectado = contactoAfectado;
        this.usuarioAfectado = usuarioAfectado;
        this.accion = accion;
        this.usuarioEjecutor = usuarioEjecutor;
        this.detalle = detalle;
    }

    @PrePersist
    void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }

}
