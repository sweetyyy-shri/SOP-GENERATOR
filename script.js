* SOP Generator: front-end interactions only (no backend) */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Typing headline (about 5 seconds) ---------- */
 var title = document.getElementById("typing-title");
var typed = title ? title.querySelector(".typed") : null;
var fullText = title ? title.getAttribute("data-text") : "";
var DURATION = 3000; // milliseconds for the whole headline

  function startTyping() {
    var start = null;
    function tick(now) {
      if (start === null) start = now;
      var progress = Math.min((now - start) / DURATION, 1);
      typed.textContent = fullText.slice(0, Math.ceil(progress * fullText.length));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(function () { typed.classList.add("done"); }, 2000); // hide caret
      }
    }
    requestAnimationFrame(tick);
  }

if (typed && fullText) {
  if (reduceMotion) {
    typed.textContent = fullText;
    typed.classList.add("done");
  } else {
    var begin = function () {
      setTimeout(startTyping, 350);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(begin);
    } else {
      begin();
    }
  }
}

  /* ---------- 2. Header shadow on scroll ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Nav: highlight current section, close mobile menu ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var sectionLinks = document.querySelectorAll(".nav-links a[data-section]");

  document.querySelectorAll(".nav-links a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (link.getAttribute("href") === "#") e.preventDefault(); // placeholder links
      navToggle.checked = false;
    });
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(function (link) {
          var active = link.getAttribute("data-section") === entry.target.id;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "page");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px" });

    ["welcome", "create"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  /* ---------- 4. Form: progress, counter, validation ---------- */
  var form = document.getElementById("sop-form");
  var titleInput = document.getElementById("sop-title");
  var processInput = document.getElementById("sop-process");
  var progressFields = ["sop-title", "sop-process", "sop-department", "sop-role", "sop-tools"]
    .map(function (id) { return document.getElementById(id); });
  var progressFill = document.getElementById("progress-fill");
  var progressLabel = document.getElementById("progress-label");
  var processCount = document.getElementById("process-count");

 function updateProgress() {
  var filled = progressFields.filter(function (f) {
    return f && f.value.trim() !== "";
  }).length;

  if (progressFill) {
    progressFill.style.width =
      (filled / progressFields.length) * 100 + "%";
  }

  if (progressLabel) {
    progressLabel.textContent =
      filled + " of " + progressFields.length + " fields filled";
  }
}
progressFields.forEach(function (field) {
  if (field) {
    field.addEventListener("input", updateProgress);
    field.addEventListener("change", updateProgress);
  }
});

  function updateCounter() {
    var n = processInput.value.trim().length;
    if (n === 0) {
      processCount.textContent = "The more detail you add, the better the result.";
      processCount.classList.remove("good");
    } else if (n < 100) {
      processCount.textContent = n + " characters. Add a bit more detail for a stronger SOP.";
      processCount.classList.remove("good");
    } else {
      processCount.textContent = n + " characters. That's a good amount of detail.";
      processCount.classList.add("good");
    }
  }

  function setInvalid(input, invalid) {
    var field = input.closest(".field");
    var error = document.getElementById(input.id.replace("sop-", "") + "-error");
    field.classList.toggle("invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (error) error.hidden = !invalid;
  }

  [titleInput, processInput].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.value.trim() !== "") setInvalid(input, false);
    });
  });
 var generateBtn= document.getElementById("generate-btn");
 var btnLabel= generateBtn.querySelector(".btn-label");
 if(!btnLabel) btnLabel=generateBtn;
 function showToast(message) {
  var toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
  } else {
    alert(message);
  }
}
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (generateBtn.disabled) return;

    var titleEmpty = titleInput.value.trim() === "";
    var processEmpty = processInput.value.trim() === "";

    setInvalid(titleInput, titleEmpty);
    setInvalid(processInput, processEmpty);

    if (titleEmpty || processEmpty) {
      (titleEmpty ? titleInput : processInput).focus();
      return;
    }

    generateBtn.disabled = true;
    generateBtn.classList.add("loading");
    btnLabel.textContent = "Generating…";

    try {
      var response = await fetch("https://sop-generator-backend.onrender.com/api/generate-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: document.getElementById("sop-department").value,
          process: titleInput.value.trim(),
          description: processInput.value.trim()
        })
      });

      var data;

try {
  data = await response.json();
} catch (error) {
  throw new Error("The server returned an invalid response. Please try again.");
}

      if (!response.ok) {
        throw new Error(data.error || "Could not generate SOP.");
      }

      console.log("Generated SOP:", data);
      const result = document.getElementById("sop-result");

document.getElementById("result-title").textContent =
    data.title || titleInput.value.trim();

document.getElementById("result-objective").textContent = data.objective || "";
document.getElementById("result-scope").textContent = data.scope || "";
document.getElementById("result-note").textContent = data.review_note || "";

function fillList(id, items) {
    const list = document.getElementById(id);
    list.replaceChildren();

    (items || []).forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
    });
}

fillList("result-roles", data.roles);
fillList("result-steps", data.steps);
fillList("result-checklist", data.checklist);
fillList("result-workflow", data.workflow);

result.hidden = false;
result.scrollIntoView({ behavior: "smooth" });
      showToast("SOP generated successfully! Check the browser console.");

    } catch (error) {
      console.error(error);
      showToast("Error: " + error.message);
    } finally {
      generateBtn.disabled = false;
      generateBtn.classList.remove("loading");
      btnLabel.textContent = "Generate SOP";
    }
  });
  updateProgress();
})();
const downloadButton = document.getElementById("download-sop");

if (downloadButton) {
  downloadButton.addEventListener("click", () => {
    const result = document.getElementById("sop-result");

    const content = [
        document.getElementById("result-title").textContent,
        "",
        "OBJECTIVE",
        document.getElementById("result-objective").textContent,
        "",
        "SCOPE",
        document.getElementById("result-scope").textContent,
        "",
        ...["roles", "steps", "checklist", "workflow"].map(id => {
            const heading = {
                roles: "ROLES AND RESPONSIBILITIES",
                steps: "PROCEDURE STEPS",
                checklist: "CHECKLIST",
                workflow: "WORKFLOW"
            }[id];

            const items = [...result.querySelectorAll(`#result-${id} li`)]
                .map((li, i) => `${i + 1}. ${li.textContent}`);

            return [heading, ...items, ""].join("\n");
        }),
        "REVIEW NOTE",
        document.getElementById("result-note").textContent
    ].join("\n");

    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Generated-SOP.txt";
    link.click();

    URL.revokeObjectURL(url);
});
}
