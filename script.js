/**
 * SCRIPT.JS - CÔNG TY TNHH THIẾT KẾ & XÂY DỰNG MINH PHÚC
 * Viết bằng JavaScript thuần (Vanilla JS), không dùng thư viện ngoài.
 * Có ghi chú tiếng Việt chi tiết để người mới học làm web dễ đọc hiểu.
 */

document.addEventListener('DOMContentLoaded', function () {
  // Kiểm tra xem trình duyệt của người dùng có bật chế độ "Giảm chuyển động" hay không
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isReducedMotion = () => reducedMotionQuery.matches;

  /* =========================================================================
     1. HEADER CỐ ĐỊNH KHI CUỘN & MENU HAMBURGER TRÊN ĐIỆN THOẠI
     ========================================================================= */
  const siteHeader = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  // Đổ bóng nhẹ cho thanh header khi người dùng cuộn trang xuống
  function updateHeaderOnScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 12) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  // Đóng / mở menu điều hướng trên màn hình điện thoại
  function closeMobileMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      mainNav.classList.toggle('is-open', !isOpen);
    });

    // Tự đóng menu khi người dùng bấm chọn một mục
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Bấm phím Escape để đóng menu nhanh
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    });
  }

  /* =========================================================================
     2. HIỆU ỨNG CUỘN TỚI ĐÂU HIỆN DẦN TỚI ĐÓ (SCROLL REVEAL)
     ========================================================================= */
  const revealElements = document.querySelectorAll('.reveal');

  if (isReducedMotion() || !('IntersectionObserver' in window)) {
    // Nếu người dùng bật giảm chuyển động hoặc trình duyệt cũ: hiện ngay lập tức
    revealElements.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Chỉ chạy hiệu ứng 1 lần khi cuộn tới
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -36px 0px'
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* =========================================================================
     3. HIỆU ỨNG CHẠY SỐ LIỆU Ở PHẦN HERO (0 -> SỐ ĐÍCH)
     ========================================================================= */
  const counterElements = document.querySelectorAll('.counter-number');
  const heroStatsSection = document.getElementById('hero-stats');
  let hasAnimatedCounters = false;

  function animateCounter(el) {
    const target = Number(el.getAttribute('data-target')) || 0;

    if (isReducedMotion()) {
      el.textContent = String(target);
      return;
    }

    const duration = 1400; // Thời gian chạy số: 1.4 giây
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Hàm làm mượt tốc độ (nhanh lúc đầu, chậm dần khi gần tới đích)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(target * eased);

      el.textContent = String(currentValue);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(step);
  }

  function startAllCounters() {
    if (hasAnimatedCounters) return;
    hasAnimatedCounters = true;
    counterElements.forEach(animateCounter);
  }

  if (heroStatsSection && 'IntersectionObserver' in window && !isReducedMotion()) {
    const statsObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          startAllCounters();
          statsObserver.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    statsObserver.observe(heroStatsSection);
  } else {
    startAllCounters();
  }

  /* =========================================================================
     4. CÔNG CỤ TÍNH CHI PHÍ XÂY NHÀ (DỰ TOÁN MẪU)
     Công thức:
     - Diện tích sàn các tầng = Diện tích 1 sàn * Số tầng
     - Diện tích quy đổi móng = Diện tích sàn các tầng * Hệ số móng
       (Móng đơn: +20%, Móng băng: +30%, Móng cọc: +40%)
     - Tổng diện tích xây = Diện tích sàn các tầng + Diện tích quy đổi móng
     - Tổng tiền = Tổng diện tích xây * Đơn giá theo m2
     Ví dụ kiểm tra: Nhà phố, 60 m2, 3 tầng, Móng băng (+30%), Gói Khá (6.500.000đ)
     => (60 * 3) + (180 * 0.3) = 180 + 54 = 234 m2 * 6.500.000đ = 1.521.000.000đ
     ========================================================================= */
  const UNIT_PRICES = {
    'nha-pho': {
      'trung-binh': 5900000,
      'kha': 6500000,
      'cao-cap': 7400000
    },
    'biet-thu': {
      'trung-binh': 6800000,
      'kha': 7500000,
      'cao-cap': 8600000
    }
  };

  const HOUSE_TYPE_LABELS = {
    'nha-pho': 'Nhà phố',
    'biet-thu': 'Biệt thự'
  };

  const PACKAGE_LABELS = {
    'trung-binh': 'Gói Trung bình',
    'kha': 'Gói Khá',
    'cao-cap': 'Gói Cao cấp'
  };

  const FOUNDATION_CONFIG = {
    'mong-don': { factor: 0.2, label: 'Móng đơn +20%' },
    'mong-bang': { factor: 0.3, label: 'Móng băng +30%' },
    'mong-coc': { factor: 0.4, label: 'Móng cọc +40%' }
  };

  // Hàm định dạng số sang tiền Việt chuẩn dấu chấm ngăn cách hàng nghìn (ví dụ: 1.521.000.000đ)
  function formatVND(number) {
    const rounded = Math.round(number);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
  }

  // Hàm định dạng diện tích gọn đẹp (bỏ số 0 thừa sau dấu phẩy nếu là số nguyên)
  function formatArea(area) {
    const rounded = Math.round(area * 100) / 100;
    return Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
  }

  const houseTypeSelect = document.getElementById('calc-house-type');
  const packageSelect = document.getElementById('calc-package');
  const areaInput = document.getElementById('calc-area');
  const floorsInput = document.getElementById('calc-floors');
  const foundationSelect = document.getElementById('calc-foundation');
  const btnCalculate = document.getElementById('btn-calculate');
  const btnSampleExample = document.getElementById('btn-sample-example');

  const elTotalPrice = document.getElementById('result-total-price');
  const elSummaryType = document.getElementById('result-summary-type');
  const elFloorArea = document.getElementById('result-floor-area');
  const elFoundationArea = document.getElementById('result-foundation-area');
  const elTotalArea = document.getElementById('result-total-area');
  const elUnitPrice = document.getElementById('result-unit-price');

  function calculateConstructionCost() {
    if (!houseTypeSelect || !packageSelect || !areaInput || !floorsInput || !foundationSelect) {
      return;
    }

    const houseType = houseTypeSelect.value;
    const materialPackage = packageSelect.value;
    const foundationKey = foundationSelect.value;

    // Đọc diện tích sàn 1 tầng và số tầng, đảm bảo luôn là số dương hợp lệ
    const rawArea = parseFloat(areaInput.value);
    const rawFloors = parseInt(floorsInput.value, 10);

    const floorAreaPerLevel = !isNaN(rawArea) && rawArea > 0 ? rawArea : 0;
    const floorsCount = !isNaN(rawFloors) && rawFloors > 0 ? rawFloors : 0;

    const foundationInfo = FOUNDATION_CONFIG[foundationKey] || FOUNDATION_CONFIG['mong-bang'];
    const unitPrice =
      (UNIT_PRICES[houseType] && UNIT_PRICES[houseType][materialPackage]) || 6500000;

    // Tính toán diện tích và tổng chi phí
    const totalFloorsArea = floorAreaPerLevel * floorsCount;
    const foundationArea = Math.round(totalFloorsArea * foundationInfo.factor * 100) / 100;
    const totalBuildArea = Math.round((totalFloorsArea + foundationArea) * 100) / 100;
    const totalCost = Math.round(totalBuildArea * unitPrice);

    // Cập nhật kết quả lên giao diện nếu các phần tử còn tồn tại
    if (elSummaryType) {
      elSummaryType.textContent =
        HOUSE_TYPE_LABELS[houseType] + ' — ' + PACKAGE_LABELS[materialPackage];
    }
    if (elFloorArea) {
      elFloorArea.textContent =
        formatArea(totalFloorsArea) +
        ' m² (' +
        formatArea(floorAreaPerLevel) +
        ' m² × ' +
        floorsCount +
        ' tầng)';
    }
    if (elFoundationArea) {
      elFoundationArea.textContent =
        formatArea(foundationArea) + ' m² (' + foundationInfo.label + ')';
    }
    if (elTotalArea) {
      elTotalArea.textContent = formatArea(totalBuildArea) + ' m²';
    }
    if (elUnitPrice) {
      elUnitPrice.textContent = formatVND(unitPrice) + '/m²';
    }
    if (elTotalPrice) {
      elTotalPrice.textContent = formatVND(totalCost);
    }
  }

  // Tự động tính lại mỗi khi người dùng thay đổi thông số
  [houseTypeSelect, packageSelect, areaInput, floorsInput, foundationSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', calculateConstructionCost);
      control.addEventListener('change', calculateConstructionCost);
    }
  });

  // Nút điền nhanh ví dụ chuẩn: Nhà phố, 60 m2, 3 tầng, móng băng, gói Khá -> 1.521.000.000đ
  if (btnSampleExample) {
    btnSampleExample.addEventListener('click', function () {
      houseTypeSelect.value = 'nha-pho';
      packageSelect.value = 'kha';
      areaInput.value = '60';
      floorsInput.value = '3';
      foundationSelect.value = 'mong-bang';
      calculateConstructionCost();
    });
  }

  // Tính toán lần đầu khi trang vừa tải xong
  calculateConstructionCost();

  /* =========================================================================
     CỬA SỔ MODAL NHẬP SỐ ĐIỆN THOẠI ĐỂ GỬI BÁO GIÁ
     - Tự động bật lên khi khách bấm "Tính chi phí ngay"
     - Hỗ trợ autocomplete="tel" để bàn phím điện thoại tự động gợi ý số SIM 1 chạm
     - Tự động lưu/điền trước số điện thoại đã lưu trong thiết bị (localStorage)
     ========================================================================= */
  const quoteModal = document.getElementById('quote-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalFormView = document.getElementById('modal-form-view');
  const modalSuccessView = document.getElementById('modal-success-view');
  const quoteLeadForm = document.getElementById('quote-lead-form');
  const modalPhoneInput = document.getElementById('modal-phone');
  const modalNameInput = document.getElementById('modal-name');
  const modalPhoneError = document.getElementById('modal-phone-error');

  const modalEstCost = document.getElementById('modal-est-cost');
  const modalSummaryType = document.getElementById('modal-summary-type');
  const modalSummaryScale = document.getElementById('modal-summary-scale');
  const modalSummaryArea = document.getElementById('modal-summary-area');

  const successSummaryDesc = document.getElementById('success-summary-desc');
  const successCostText = document.getElementById('success-cost-text');
  const successPhoneText = document.getElementById('success-phone-text');
  const successZaloBtn = document.getElementById('success-zalo-btn');
  const btnCloseAndView = document.getElementById('btn-close-and-view');

  function openQuoteModal() {
    if (!quoteModal) return;

    // Lấy thông số công trình khách vừa chọn
    const houseType = houseTypeSelect ? houseTypeSelect.value : 'nha-pho';
    const materialPackage = packageSelect ? packageSelect.value : 'kha';
    const areaVal = areaInput ? areaInput.value : '60';
    const floorsVal = floorsInput ? floorsInput.value : '3';
    const foundationName = foundationSelect ? foundationSelect.options[foundationSelect.selectedIndex].text.split('(')[0].trim() : 'Móng băng';

    const houseLabel = HOUSE_TYPE_LABELS[houseType] || 'Nhà phố';
    const pkgLabel = PACKAGE_LABELS[materialPackage] || 'Gói Khá';
    const summaryType = houseLabel + ' — ' + pkgLabel;
    const scaleText = areaVal + ' m² × ' + floorsVal + ' tầng (' + foundationName + ')';

    // Tính diện tích sàn và diện tích quy đổi
    const foundationInfo = FOUNDATION_CONFIG[foundationSelect ? foundationSelect.value : 'mong-bang'] || { factor: 0.3 };
    const totalFloorsArea = (parseFloat(areaVal) || 60) * (parseInt(floorsVal, 10) || 3);
    const totalBuildArea = Math.round((totalFloorsArea + (totalFloorsArea * foundationInfo.factor)) * 100) / 100;

    if (modalSummaryType) modalSummaryType.textContent = summaryType;
    if (modalSummaryScale) modalSummaryScale.textContent = scaleText;
    if (modalSummaryArea) modalSummaryArea.textContent = 'Quy mô quy đổi: ' + formatArea(totalBuildArea) + ' m²';

    // Reset giao diện về trạng thái form nhập liệu
    if (modalFormView) modalFormView.hidden = false;
    if (modalSuccessView) modalSuccessView.hidden = true;
    if (modalPhoneError) modalPhoneError.hidden = true;

    // Điền sẵn số điện thoại / tên đã lưu trên máy (nếu có từ trước)
    try {
      const savedPhone = localStorage.getItem('mp_customer_phone');
      const savedName = localStorage.getItem('mp_customer_name');
      if (savedPhone && modalPhoneInput && !modalPhoneInput.value) {
        modalPhoneInput.value = savedPhone;
      }
      if (savedName && modalNameInput && !modalNameInput.value) {
        modalNameInput.value = savedName;
      }
    } catch (e) {}

    // Hiển thị modal
    quoteModal.hidden = false;
    document.body.style.overflow = 'hidden'; // Ngăn cuộn nền trang

    // Tự động focus vào ô số điện thoại để kích hoạt gợi ý số SIM từ bàn phím di động
    setTimeout(function () {
      if (modalPhoneInput) {
        modalPhoneInput.focus();
      }
    }, 120);
  }

  function closeQuoteModal() {
    if (!quoteModal) return;
    quoteModal.hidden = true;
    document.body.style.overflow = '';
  }

  // Bấm nút "Tính chi phí ngay" sẽ bật cửa sổ modal nhập số điện thoại
  if (btnCalculate) {
    btnCalculate.addEventListener('click', function () {
      openQuoteModal();
    });
  }

  // Đóng modal bằng nút X, click ngoài nền mờ hoặc phím Escape
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeQuoteModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeQuoteModal);
  
  // Nút đóng modal và cuộn xuống xem các kênh liên hệ khác ở cuối trang
  if (btnCloseAndView) {
    btnCloseAndView.addEventListener('click', function () {
      closeQuoteModal();
      const contactSection = document.getElementById('lien-he');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // Nút "Nhận báo giá chi tiết cho công trình của bạn" ở panel dự toán
  // Bấm vào sẽ cuộn xuống cuối trang chỗ thông tin liên hệ và điền trước thông số công trình
  const btnQuoteContact = document.getElementById('btn-quote-contact');
  if (btnQuoteContact) {
    btnQuoteContact.addEventListener('click', function () {
      const contactNeedInput = document.getElementById('contact-need');
      if (contactNeedInput && (!contactNeedInput.value || contactNeedInput.value.startsWith('Tư vấn công trình:'))) {
        const houseLabel = HOUSE_TYPE_LABELS[houseTypeSelect ? houseTypeSelect.value : 'nha-pho'] || 'Nhà phố';
        const pkgLabel = PACKAGE_LABELS[packageSelect ? packageSelect.value : 'kha'] || 'Gói Khá';
        const areaVal = areaInput ? areaInput.value : '60';
        const floorsVal = floorsInput ? floorsInput.value : '3';
        contactNeedInput.value = 'Tư vấn xây dựng: ' + houseLabel + ' (' + pkgLabel + '), quy mô ' + areaVal + ' m² × ' + floorsVal + ' tầng. Nhờ Minh Phúc liên hệ tư vấn và gửi bảng bóc tách khối lượng chi tiết.';
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && quoteModal && !quoteModal.hidden) {
      closeQuoteModal();
    }
  });

  // Xử lý gửi số điện thoại nhận báo giá
  if (quoteLeadForm) {
    quoteLeadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const phoneVal = modalPhoneInput ? modalPhoneInput.value.trim() : '';
      const nameVal = modalNameInput ? modalNameInput.value.trim() : '';

      // Kiểm tra định dạng số điện thoại Việt Nam (ít nhất 9-11 chữ số)
      const digitsOnly = phoneVal.replace(/[^0-9]/g, '');

      if (!phoneVal || digitsOnly.length < 9 || digitsOnly.length > 11) {
        if (modalPhoneError) {
          modalPhoneError.hidden = false;
          modalPhoneError.textContent = 'Vui lòng nhập đúng số điện thoại (ví dụ: 0972 892 812)';
        }
        if (modalPhoneInput) modalPhoneInput.focus();
        return;
      }

      if (modalPhoneError) modalPhoneError.hidden = true;

      // Lưu số điện thoại vào thiết bị để tự động điền lần sau
      try {
        localStorage.setItem('mp_customer_phone', phoneVal);
        if (nameVal) localStorage.setItem('mp_customer_name', nameVal);
      } catch (e) {}

      // Chuẩn bị nội dung hiển thị thành công
      const houseLabel = HOUSE_TYPE_LABELS[houseTypeSelect ? houseTypeSelect.value : 'nha-pho'] || 'Nhà phố';
      const pkgLabel = PACKAGE_LABELS[packageSelect ? packageSelect.value : 'kha'] || 'Gói Khá';
      const areaVal = areaInput ? areaInput.value : '60';
      const floorsVal = floorsInput ? floorsInput.value : '3';
      const summaryText = houseLabel + ' (' + pkgLabel + '), ' + areaVal + ' m² × ' + floorsVal + ' tầng';

      if (successSummaryDesc) successSummaryDesc.textContent = summaryText;
      if (successPhoneText) successPhoneText.textContent = phoneVal;

      // Tạo link nhắn tin Zalo với thông số đã chọn (số hotline mẫu 0972892812)
      if (successZaloBtn) {
        const zaloMsg = encodeURIComponent(
          'Xin chào Minh Phúc, tôi vừa gửi yêu cầu báo giá trên website cho công trình: ' + summaryText +
          '. Số điện thoại của tôi: ' + phoneVal +
          (nameVal ? ' (' + nameVal + ')' : '') +
          '. Nhờ công ty tư vấn và gửi bảng bóc tách chi tiết giúp tôi.'
        );
        successZaloBtn.href = 'https://zalo.me/0972892812?text=' + zaloMsg;
      }

      // Điền sẵn vào form liên hệ ở cuối trang để đồng bộ
      const contactPhoneInput = document.getElementById('contact-phone');
      const contactNameInput = document.getElementById('contact-name');
      const contactNeedInput = document.getElementById('contact-need');
      if (contactPhoneInput && !contactPhoneInput.value) contactPhoneInput.value = phoneVal;
      if (contactNameInput && !contactNameInput.value && nameVal) contactNameInput.value = nameVal;
      if (contactNeedInput && (!contactNeedInput.value || contactNeedInput.value.startsWith('Tư vấn xây dựng:'))) {
        contactNeedInput.value = 'Tư vấn xây dựng: ' + summaryText + '. Nhờ Minh Phúc liên hệ tư vấn bóc tách chi tiết.';
      }

      // Chuyển sang màn hình thành công
      if (modalFormView) modalFormView.hidden = true;
      if (modalSuccessView) modalSuccessView.hidden = false;
    });
  }

  /* =========================================================================
     5. BỘ LỌC DỰ ÁN CHUYỂN MỜ DẦN (FADE TRANSITION)
     ========================================================================= */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectsGrid = document.getElementById('projects-grid');
  const projectCards = document.querySelectorAll('.project-card');
  let filterTimeoutId = null;

  function applyProjectFilter(selectedCategory) {
    projectCards.forEach(function (card) {
      const cardCategory = card.getAttribute('data-category');
      const shouldShow = selectedCategory === 'all' || cardCategory === selectedCategory;
      card.classList.toggle('is-hidden', !shouldShow);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const filterValue = button.getAttribute('data-filter') || 'all';

      // Cập nhật nút đang chọn
      filterButtons.forEach(function (btn) {
        const isCurrent = btn === button;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-selected', String(isCurrent));
      });

      if (!projectsGrid || isReducedMotion()) {
        applyProjectFilter(filterValue);
        return;
      }

      // Hiệu ứng mờ dần ra rồi hiện lại mượt mà
      if (filterTimeoutId) {
        clearTimeout(filterTimeoutId);
      }

      projectsGrid.classList.add('is-filtering');
      filterTimeoutId = setTimeout(function () {
        applyProjectFilter(filterValue);
        projectsGrid.classList.remove('is-filtering');
      }, 200);
    });
  });

  /* =========================================================================
     6. HỎI ĐÁP DẠNG ACCORDION (BẤM ĐỂ MỞ, DẤU CỘNG XOAY 45 ĐỘ)
     ========================================================================= */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const questionBtn = item.querySelector('.faq-question');
    const answerBox = item.querySelector('.faq-answer');

    if (!questionBtn || !answerBox) return;

    questionBtn.addEventListener('click', function () {
      const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';

      // Đóng các câu hỏi đang mở khác để giao diện luôn gọn gàng
      faqItems.forEach(function (otherItem) {
        const otherBtn = otherItem.querySelector('.faq-question');
        const otherAns = otherItem.querySelector('.faq-answer');
        if (otherBtn && otherAns && otherItem !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAns.style.maxHeight = '0px';
        }
      });

      // Đảo trạng thái câu hỏi hiện tại
      if (isExpanded) {
        questionBtn.setAttribute('aria-expanded', 'false');
        answerBox.style.maxHeight = '0px';
      } else {
        questionBtn.setAttribute('aria-expanded', 'true');
        answerBox.style.maxHeight = answerBox.scrollHeight + 'px';
      }
    });
  });

  /* =========================================================================
     7. FORM LIÊN HỆ MỞ EMAIL SOẠN SẴN (MAILTO - KHÔNG GIẢ VỜ CÓ BACKEND)
     ========================================================================= */
  const contactForm = document.getElementById('contact-mailto-form');
  const feedbackBox = document.getElementById('form-feedback');

  function showFormFeedback(message, type) {
    if (!feedbackBox) return;
    feedbackBox.hidden = false;
    feedbackBox.className = 'form-feedback ' + (type === 'error' ? 'is-error' : 'is-info');
    feedbackBox.textContent = message;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const nameInput = document.getElementById('contact-name');
      const phoneInput = document.getElementById('contact-phone');
      const needInput = document.getElementById('contact-need');

      const fullName = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const need = needInput ? needInput.value.trim() : '';

      if (!fullName || !phone || !need) {
        showFormFeedback(
          'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nhu cầu trước khi mở trình soạn Email.',
          'error'
        );
        return;
      }

      const recipient = 'lienhe@xaydungminhphuc.com';
      const subject = '[Tư vấn xây dựng - xaydungminhphuc.com] Yêu cầu từ ' + fullName;
      const bodyLines = [
        'Kính gửi Công Ty TNHH Thiết Kế & Xây Dựng Minh Phúc,',
        '',
        'Tôi muốn liên hệ tư vấn với thông tin như sau:',
        '- Họ và tên: ' + fullName,
        '- Số điện thoại: ' + phone,
        '- Nhu cầu cụ thể: ' + need,
        '',
        'Mong sớm nhận được phản hồi từ quý công ty. Xin cảm ơn!'
      ];

      const mailtoUrl =
        'mailto:' +
        recipient +
        '?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(bodyLines.join('\n'));

      showFormFeedback(
        'Đang mở ứng dụng Email trên thiết bị của bạn với nội dung đã soạn sẵn tới ' +
          recipient +
          '. Vui lòng kiểm tra và bấm nút "Gửi" trong ứng dụng Email để hoàn tất.',
        'info'
      );

      // Chuyển hướng sang giao thức mailto:
      window.location.href = mailtoUrl;
    });
  }

  /* =========================================================================
     8. ẢNH DỰ PHÒNG AN TOÀN KHI MẤT KẾT NỐI INTERNET
     ========================================================================= */
  const fallbackSvg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='560' viewBox='0 0 800 560'%3E%3Crect width='800' height='560' fill='%23dce9df'/%3E%3Cpath d='M180 380L400 200l220 180v90H180v-90z' fill='%231e7a4c' opacity='0.18'/%3E%3Cpath d='M150 370L400 170l250 200' stroke='%231e7a4c' stroke-width='12' fill='none' stroke-linecap='round'/%3E%3Crect x='355' y='340' width='90' height='130' rx='8' fill='%2320704a' opacity='0.35'/%3E%3Ctext x='400' y='515' text-anchor='middle' font-family='sans-serif' font-size='22' fill='%2320704a'%3EAnh minh hoa kien truc (mau)%3C/text%3E%3C/svg%3E";

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      if (img.src !== fallbackSvg) {
        img.src = fallbackSvg;
      }
    });
  });
});
