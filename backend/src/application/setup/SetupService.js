export class SetupService {
  constructor(options = {}) {
    this.initialized = options.initialized ?? (process.env.ONECRM_SETUP_EXISTS || "true") === "true";
    this.maintenance = options.maintenance ?? (process.env.ONECRM_SYS_MAINTENANCE || "false") === "true";
  }

  checkAdminSetup() {
    if (this.maintenance) {
      return { ok: false, status: 503, code: "SYS_MAINTENANCE" };
    }

    return {
      ok: true,
      data: {
        exists: this.initialized
      }
    };
  }
}

