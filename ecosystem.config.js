module.exports = {
  apps: [
    {
      name: "campus_sheba_prod",
      script: "npm",
      args: "start",
      max_memory_restart: "300M",
      instances: "max",
      exec_mode: "cluster"
    }
  ]
}