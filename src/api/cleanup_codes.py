# cleanup_codes.py

from datetime import datetime, timedelta
from api.models import (
    db,
    AsignedCode,
)  # Asegúrate de importar tus modelos y tu base de datos correctamente


def cleanup_codes():
    # Obtener la fecha y hora actuales
    now = datetime.utcnow()

    # Buscar códigos que se hayan asignado hace más de 24 horas
    old_codes = AsignedCode.query.filter(
        AsignedCode.requested_at < now - timedelta(hours=24)
    ).all()

    # Actualizar el estado de esos códigos a inactivo
    for code in old_codes:
        code.is_active = False

    # Hacer commit de los cambios
    db.session.commit()

    # Buscar códigos que se hayan asignado hace más de 90 días
    very_old_codes = AsignedCode.query.filter(
        AsignedCode.requested_at < now - timedelta(days=90)
    ).all()

    # Eliminar esos códigos
    for code in very_old_codes:
        db.session.delete(code)

    # Hacer commit de los cambios
    db.session.commit()


if __name__ == "__main__":
    cleanup_codes()
