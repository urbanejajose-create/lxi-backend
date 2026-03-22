#!/usr/bin/env python3
"""
Verificacion realista de configuracion para LXI.
No expone secretos y detecta placeholders o credenciales faltantes.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


def print_header(text):
    print(f"\n{BOLD}{BLUE}{'=' * 60}{RESET}")
    print(f"{BOLD}{BLUE}{text}{RESET}")
    print(f"{BOLD}{BLUE}{'=' * 60}{RESET}\n")


def print_ok(text):
    print(f"{GREEN}OK {text}{RESET}")


def print_error(text):
    print(f"{RED}ERROR {text}{RESET}")


def print_warning(text):
    print(f"{YELLOW}WARN {text}{RESET}")


def is_real_value(value: str, blocked_tokens):
    if not value:
        return False
    upper_value = value.upper()
    return not any(token in upper_value for token in blocked_tokens)


def main():
    print_header("VERIFICACION DE CONFIGURACION LXI")

    env_path = Path(__file__).parent / ".env"
    if not env_path.exists():
        print_error(f"No existe {env_path}")
        return 1

    load_dotenv(env_path)

    checks = []

    mongo_url = os.getenv("MONGO_URL", "")
    checks.append(("MongoDB URL", is_real_value(mongo_url, ["ROTATE_AND_SET", "REEMPLAZA", "USERNAME:PASSWORD"])))

    db_name = os.getenv("DB_NAME", "")
    checks.append(("DB_NAME", bool(db_name)))

    stripe_key = os.getenv("STRIPE_API_KEY", "")
    checks.append(("Stripe key", is_real_value(stripe_key, ["ROTATE_AND_SET", "REEMPLAZA", "YOUR_STRIPE"])))

    stripe_webhook = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    checks.append(("Stripe webhook", is_real_value(stripe_webhook, ["SET_NEW", "WHSEC_YOUR"])))

    paypal_client_id = os.getenv("PAYPAL_CLIENT_ID", "")
    paypal_client_secret = os.getenv("PAYPAL_CLIENT_SECRET", "")
    checks.append(("PayPal client id", is_real_value(paypal_client_id, ["SET_NEW", "YOUR_PAYPAL"])))
    checks.append(("PayPal client secret", is_real_value(paypal_client_secret, ["SET_NEW", "YOUR_PAYPAL"])))

    printful_key = os.getenv("PRINTFUL_API_KEY", "")
    checks.append(("Printful key", is_real_value(printful_key, ["ROTATE_AND_SET", "REEMPLAZA", "YOUR_PRINTFUL"])))

    printful_webhook = os.getenv("PRINTFUL_WEBHOOK_SECRET_HEX", "")
    checks.append(("Printful webhook", is_real_value(printful_webhook, ["SET_", "YOUR_PRINTFUL"])))

    secret_key = os.getenv("SECRET_KEY", "")
    checks.append(("App secret key", is_real_value(secret_key, ["SET_A_NEW", "CHANGE", "12345"])))

    cors_origins = os.getenv("CORS_ORIGINS", "")
    checks.append(("CORS", bool(cors_origins)))

    failures = 0
    for label, ok in checks:
        if ok:
            print_ok(label)
        else:
            print_warning(f"{label} pendiente o con placeholder")
            failures += 1

    print_header("RESUMEN")
    if failures == 0:
        print_ok("Configuracion completa para continuar con pruebas reales.")
        return 0

    print_warning(f"Hay {failures} elementos pendientes.")
    print("Siguiente paso recomendado:")
    print("1. Completar backend/.env con credenciales reales.")
    print("2. Ejecutar este script otra vez.")
    print("3. Probar Stripe antes de PayPal y Printful.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
