/**
 * 个人简历渲染与交互逻辑 (app.js)
 * 从 window.RESUME_DATA 读取结构化数据并渲染各信息分区
 */
(function () {
  const data = window.RESUME_DATA;
  if (!data) return;

  // HTML 转义，避免占位或用户填写文本中的特殊符号破坏结构
  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 内置精简 SVG 图标
  const ICONS = {
    location:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    mail:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    phone:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>',
    chat:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    github:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
    globe:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    linkedin:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
    external:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    sun:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>'
  };

  function getLevelClass(level) {
    if (level === "精通") return "level-expert";
    if (level === "熟练") return "level-proficient";
    return "level-familiar";
  }

  // Toast 提示
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  // 复制到剪贴板
  async function copyText(text, label) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement("textarea");
        input.value = text;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      showToast(`已复制${label}：${text}`);
    } catch {
      showToast("复制失败，请手动选中复制");
    }
  }

  // 1. 渲染页标题、品牌名与首页概览
  function renderHero() {
    document.title = data.meta.pageTitle || `${data.profile.name} - 个人简历`;
    document.getElementById("brandName").textContent = data.profile.name;

    const p = data.profile;
    const avatarHtml = p.avatarUrl
      ? `<img src="${esc(p.avatarUrl)}" alt="${esc(p.name)}的头像" />`
      : `<span>${esc(p.initials || p.name.slice(0, 1))}</span>`;

    const socialsHtml = (p.socials || [])
      .map(
        (s) => `
        <a class="social-pill" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">
          ${ICONS[s.icon] || ICONS.globe}
          <span>${esc(s.label)}</span>
        </a>`
      )
      .join("");

    document.getElementById("heroCard").innerHTML = `
      <div class="hero-top">
        <div class="hero-info">
          ${
            p.status
              ? `<div class="status-badge"><span class="status-dot"></span><span>${esc(p.status)}</span></div>`
              : ""
          }
          <div class="hero-name-row">
            <h1 class="hero-name">${esc(p.name)}</h1>
            ${p.englishName ? `<span class="hero-en-name">${esc(p.englishName)}</span>` : ""}
          </div>
          <p class="hero-title">${esc(p.title)}</p>
          <div class="hero-location">${ICONS.location}<span>${esc(p.location)}</span></div>
          <p class="hero-summary">${esc(p.summary)}</p>
          <div class="hero-bio">
            ${(p.bioParagraphs || []).map((line) => `<p>${esc(line)}</p>`).join("")}
          </div>
        </div>
        <div class="hero-avatar" aria-hidden="true">${avatarHtml}</div>
      </div>

      <div class="hero-actions">
        <div class="cta-group">
          <a href="#contact" class="btn btn-primary">${ICONS.mail}<span>联系我</span></a>
          <button type="button" class="btn btn-secondary" id="heroPrintBtn">打印 / 导出 PDF</button>
        </div>
        <div class="social-links">${socialsHtml}</div>
      </div>
    `;

    document.getElementById("heroPrintBtn").addEventListener("click", () => window.print());

    // 渲染亮点指标
    document.getElementById("highlightsGrid").innerHTML = (data.highlights || [])
      .map(
        (item) => `
        <div class="card highlight-item">
          <span class="highlight-value">${esc(item.value)}</span>
          <span class="highlight-label">${esc(item.label)}</span>
        </div>`
      )
      .join("");
  }

  // 2. 渲染工作经历
  function renderExperience() {
    document.getElementById("experienceList").innerHTML = (data.experience || [])
      .map(
        (exp) => `
        <article class="card timeline-item">
          <div class="exp-header">
            <div>
              <h3 class="exp-role">${esc(exp.role)}</h3>
              <div class="exp-company">${esc(exp.company)}</div>
            </div>
            <div class="exp-meta">
              <span class="meta-pill">${esc(exp.period)}</span>
              ${exp.location ? `<span class="meta-pill">${esc(exp.location)}</span>` : ""}
            </div>
          </div>
          ${exp.summary ? `<p class="exp-summary">${esc(exp.summary)}</p>` : ""}
          <ul class="bullet-list">
            ${(exp.achievements || []).map((a) => `<li>${esc(a)}</li>`).join("")}
          </ul>
          <div class="tags-row">
            ${(exp.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          </div>
        </article>`
      )
      .join("");
  }

  // 3. 渲染项目经历与分类筛选
  let currentCategory = "全部";

  function renderProjects() {
    const projects = data.projects || [];
    const categories = ["全部", ...new Set(projects.map((p) => p.category).filter(Boolean))];

    const filterBar = document.getElementById("projectFilter");
    if (categories.length > 2) {
      filterBar.style.display = "flex";
      filterBar.innerHTML = categories
        .map(
          (cat) => `
          <button type="button" class="filter-btn ${cat === currentCategory ? "active" : ""}" data-category="${esc(cat)}">
            ${esc(cat)}
          </button>`
        )
        .join("");

      filterBar.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          currentCategory = btn.dataset.category;
          renderProjects();
        });
      });
    } else {
      filterBar.style.display = "none";
      filterBar.innerHTML = "";
    }

    const filtered =
      currentCategory === "全部"
        ? projects
        : projects.filter((p) => p.category === currentCategory);

    const projectsGrid = document.getElementById("projectsGrid");
    projectsGrid.classList.toggle("single-col", filtered.length === 1);
    projectsGrid.innerHTML = filtered
      .map(
        (proj) => `
        <article class="card project-card">
          <div class="project-top">
            <span class="project-category">${esc(proj.category)}</span>
            <span class="project-period">${esc(proj.period)}</span>
          </div>
          <h3 class="project-name">${esc(proj.name)}</h3>
          <div class="project-role">${esc(proj.role)}</div>
          <p class="project-summary">${esc(proj.summary)}</p>
          <ul class="bullet-list">
            ${(proj.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}
          </ul>
          <div class="project-footer">
            <div class="tags-row">
              ${(proj.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
            </div>
            ${
              proj.links && proj.links.length
                ? `<div class="project-links">
                    ${proj.links
                      .map(
                        (l) => `
                        <a class="project-link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
                          <span>${esc(l.label)}</span>${ICONS.external}
                        </a>`
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>
        </article>`
      )
      .join("");
  }

  // 4. 渲染教育背景
  function renderEducation() {
    const educationList = data.education || [];
    const eduGrid = document.getElementById("educationGrid");
    eduGrid.classList.toggle("single-col", educationList.length === 1);
    eduGrid.innerHTML = educationList
      .map(
        (edu) => `
        <article class="card edu-card">
          <div class="edu-top">
            <div>
              <h3 class="edu-school">${esc(edu.school)}</h3>
              <div class="edu-degree">${esc(edu.degree)} · ${esc(edu.major)}</div>
            </div>
            <span class="meta-pill">${esc(edu.period)}</span>
          </div>
          ${
            edu.honors && edu.honors.length
              ? `<div>
                  <div class="edu-subtitle">荣誉与奖项</div>
                  <ul class="bullet-list" style="margin-bottom:0">
                    ${edu.honors.map((h) => `<li>${esc(h)}</li>`).join("")}
                  </ul>
                </div>`
              : ""
          }
          ${
            edu.courses && edu.courses.length
              ? `<div>
                  <div class="edu-subtitle">主修课程</div>
                  <div class="tags-row">
                    ${edu.courses.map((c) => `<span class="tag">${esc(c)}</span>`).join("")}
                  </div>
                </div>`
              : ""
          }
        </article>`
      )
      .join("");
  }

  // 5. 渲染技能与证书
  function renderSkillsAndCerts() {
    document.getElementById("skillsGrid").innerHTML = (data.skills || [])
      .map(
        (group) => `
        <div class="card skill-group-card">
          <h3 class="skill-group-title">${esc(group.group)}</h3>
          <div class="skill-list">
            ${(group.items || [])
              .map(
                (item) => `
                <div class="skill-row">
                  <span class="skill-name">${esc(item.name)}</span>
                  <span class="level-badge ${getLevelClass(item.level)}">${esc(item.level)}</span>
                </div>`
              )
              .join("")}
          </div>
        </div>`
      )
      .join("");

    document.getElementById("certGrid").innerHTML = (data.certificates || [])
      .map(
        (cert) => `
        <article class="card cert-card">
          <div class="cert-header">
            <h4 class="cert-name">${esc(cert.name)}</h4>
            ${cert.date ? `<span class="cert-date">${esc(cert.date)}</span>` : ""}
          </div>
          ${cert.issuer ? `<div class="cert-issuer">${esc(cert.issuer)}</div>` : ""}
          ${cert.note ? `<p class="cert-note">${esc(cert.note)}</p>` : ""}
          ${cert.credentialId ? `<div class="cert-id">编号：${esc(cert.credentialId)}</div>` : ""}
        </article>`
      )
      .join("");
  }

  // 6. 渲染联系方式
  function renderContact() {
    const c = data.contact;
    const directItems = [
      c.email && { label: "电子邮箱", value: c.email, icon: "mail", href: `mailto:${c.email}`, copyable: true },
      c.phone && { label: "联系电话", value: c.phone, icon: "phone", href: `tel:${c.phone.replace(/\s+/g, "")}`, copyable: true },
      c.wechat && { label: "微信号", value: c.wechat, icon: "chat", copyable: true },
      c.location && { label: "所在城市", value: c.location, icon: "location", copyable: false }
    ].filter(Boolean);

    const linksHtml = (c.links || [])
      .map(
        (l) => `
        <a class="social-pill" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
          ${ICONS[l.icon] || ICONS.globe}
          <span>${esc(l.label)}：${esc(l.value)}</span>
        </a>`
      )
      .join("");

    document.getElementById("contactCard").innerHTML = `
      <p class="contact-intro">${esc(c.intro)}</p>
      <div class="contact-grid">
        ${directItems
          .map(
            (item) => `
            <div class="contact-item">
              <div class="contact-item-main">
                <div class="contact-icon">${ICONS[item.icon]}</div>
                <div>
                  <div class="contact-label">${esc(item.label)}</div>
                  ${
                    item.href
                      ? `<a class="contact-value" href="${esc(item.href)}">${esc(item.value)}</a>`
                      : `<div class="contact-value">${esc(item.value)}</div>`
                  }
                </div>
              </div>
              ${
                item.copyable
                  ? `<button type="button" class="copy-btn" data-copy="${esc(item.value)}" data-label="${esc(item.label)}">复制</button>`
                  : ""
              }
            </div>`
          )
          .join("")}
      </div>
      ${linksHtml ? `<div class="contact-links-row">${linksHtml}</div>` : ""}
    `;

    document.querySelectorAll(".copy-btn").forEach((btn) => {
      btn.addEventListener("click", () => copyText(btn.dataset.copy, btn.dataset.label));
    });
  }

  // 页脚信息
  function renderFooter() {
    const year = new Date().getFullYear();
    document.getElementById("footerText").textContent =
      `© ${year} ${data.profile.name} · 个人简历网站（最后更新：${data.meta.lastUpdated}）`;
  }

  // 主题切换
  function initTheme() {
    const themeBtn = document.getElementById("themeToggle");

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      themeBtn.innerHTML = theme === "dark" ? ICONS.sun : ICONS.moon;
      themeBtn.setAttribute("aria-label", theme === "dark" ? "切换浅色主题" : "切换深色主题");
      themeBtn.setAttribute("title", theme === "dark" ? "切换浅色主题" : "切换深色主题");
      try {
        localStorage.setItem("resume-theme", theme);
      } catch {}
    }

    let saved = null;
    try {
      saved = localStorage.getItem("resume-theme");
    } catch {}
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));

    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // 移动端导航抽屉 & 滚动高亮
  function initNavigation() {
    const menuToggle = document.getElementById("menuToggle");
    const mobileNav = document.getElementById("mobileNav");
    const printNavBtn = document.getElementById("printNavBtn");

    printNavBtn.addEventListener("click", () => window.print());

    function closeMenu() {
      mobileNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "打开菜单");
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "关闭菜单" : "打开菜单");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    // 滚动监听高亮当前区块导航
    const sections = Array.from(document.querySelectorAll("section[id]"));
    const allNavLinks = Array.from(document.querySelectorAll(".nav-links a, .mobile-nav a"));

    function updateActiveNav() {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      let activeId = sections[0]?.id || "overview";

      if (atBottom && sections.length) {
        activeId = sections[sections.length - 1].id;
      } else {
        const scrollPos = window.scrollY + 120;
        for (const sec of sections) {
          if (sec.offsetTop <= scrollPos) {
            activeId = sec.id;
          }
        }
      }

      allNavLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
      });
    }

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();
  }

  // 初始化全部模块
  renderHero();
  renderExperience();
  renderProjects();
  renderEducation();
  renderSkillsAndCerts();
  renderContact();
  renderFooter();
  initTheme();
  initNavigation();
})();
