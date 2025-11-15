// 이미지 경로 동적 생성
function generateImagePaths(prefix, start, end, extension = 'jpg') {
    const images = [];
    for (let i = start; i <= end; i++) {
        images.push(`images/${prefix}${i.toString().padStart(3, '0')}.${extension}`);
    }
    return images;
}

// DOM 요소
const [leftPage, rightPage] = [
    document.getElementById('leftPage'),
    document.getElementById('rightPage')
];
const [leftImage, rightImage] = [
    document.getElementById('leftImage'),
    document.getElementById('rightImage')
];
const pageCounter = document.getElementById('pageCounter');
const bookmark = document.querySelectorAll('.bookmark');

document.body.classList.add('first-page');

// 전역 상태
const lastPageIndex = 131; // images.length - 1
const images = generateImagePaths('photo', 0, lastPageIndex);
let currentPage = 0;
const imageCache = {};

// 이미지 프리로딩
function preloadImages() {
    images.forEach(imgSrc => {
        const img = new Image();
        img.src = imgSrc;
        imageCache[imgSrc] = img;
    });
}

// 페이지 이동
function goToPage(pageNumber) {
    const parsedPage = parseInt(pageNumber);
    if (isNaN(parsedPage)) {
        currentPage = 0;
        updatePages();
        return;
    }

    let clampedPage = Math.max(0, Math.min(parsedPage, lastPageIndex));
    currentPage = clampedPage % 2 === 0 ? clampedPage : clampedPage + 1;
    if (currentPage > lastPageIndex) {
        currentPage = lastPageIndex;
    }
    updatePages();
}

// 페이지 업데이트
function updatePages() {
    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage === lastPageIndex;

    // 모바일에서 first/last 클래스 토글 무시 (CSS 변경 오류 방지)
    if (!isMobile()) {
        document.body.classList.toggle('first-page', isFirstPage);
        document.body.classList.toggle('last-page', isLastPage);
    }

    if (isMobile()) {
        updateMobilePages();
        return;
    }

    if (isFirstPage) {
        leftPage.style.visibility = 'hidden';
        rightImage.src = images[0];
    } else if (isLastPage) {
        rightPage.style.visibility = 'hidden';
        leftImage.src = images[lastPageIndex];
    } else {
        leftPage.style.visibility = 'visible';
        rightPage.style.visibility = 'visible';
        leftPage.style.display = 'flex';
        rightPage.style.display = 'flex';
        leftImage.src = images[currentPage - 1];
        rightImage.src = images[currentPage] || '';
    }

    console.log(currentPage);
    updatePageCounter();
    updateActiveBookmark();
}

// 페이지 카운터 업데이트
function updatePageCounter() {
    let displayPage;
    if (isMobile()) {
        displayPage = currentPage + 1; // 1-based 페이지 번호
    } else {
        if (currentPage === 0) {
            displayPage = 1;
        } else if (currentPage === lastPageIndex) {
            displayPage = lastPageIndex + 1;
        } else {
            displayPage = currentPage; // 오른쪽 페이지 기준 (대략적인 중앙 페이지)
        }
    }

    pageCounter.innerHTML = `
        <input type="text"
               id="pageInput"
               value="${displayPage}"
               pattern="\\d*"
               style="width: 50px; text-align: center;">
        / ${images.length}
    `;

    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        pageInput.addEventListener('blur', () => {
            goToPage(pageInput.value - 1);
        });
        pageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                goToPage(pageInput.value - 1);
                pageInput.blur();
            }
        });
    }
}

// 페이지 네비게이션
function handlePageNavigation(event) {
    const isLeftPage = event.currentTarget.id === 'leftPage';

    if (isLeftPage && currentPage > 0) {
        if (currentPage === 2) {
            currentPage = 0; // 첫 페이지로
        } else {
            currentPage -= 2;
        }
        updatePages();
    } else if (!isLeftPage && currentPage < lastPageIndex) {
        if (currentPage === 130) {
            currentPage = lastPageIndex; // 마지막 단일 페이지로
        } else {
            currentPage += 2;
            if (currentPage > lastPageIndex) {
                currentPage = lastPageIndex;
            }
        }
        updatePages();
    }
}

// 방향키 이동
function handleDesktopKeyPress(event) {
    if (!isMobile()) {
        if (event.key === 'ArrowLeft') {
            if (currentPage > 0) {
                if (currentPage === 2) {
                    currentPage = 0;
                } else {
                    currentPage -= 2;
                }
                updatePages();
            }
        } else if (event.key === 'ArrowRight') {
            if (currentPage < lastPageIndex) {
                if (currentPage === 130) {
                    currentPage = lastPageIndex;
                } else {
                    currentPage += 2;
                    if (currentPage > lastPageIndex) {
                        currentPage = lastPageIndex;
                    }
                }
                updatePages();
            }
        }
    }
}

// 북마크 핸들러
function handleBookmarkClick() {
    const targetPage = parseInt(this.dataset.page);
    goToPage(targetPage - 1); // data-page는 1-based로 가정, 0-based로 변환
}

// 현재 페이지에 해당하는 북마크 활성화 함수
function updateActiveBookmark() {
    bookmark.forEach(bm => {
        const startPage = parseInt(bm.dataset.page);
        const endPage = parseInt(bm.dataset.endPage);
        const isActive = currentPage >= (startPage - 1) && currentPage <= (endPage - 1);
        bm.classList.toggle('active', isActive);
    });
}

bookmark.forEach(bm => bm.addEventListener('click', handleBookmarkClick));

// 모바일 체크 함수
function isMobile() {
    return window.innerWidth <= 768;
}

// 모바일 페이지 클릭 핸들러
function handleMobilePageClick(e) {
    const pageX = e.offsetX;
    if (pageX < rightPage.clientWidth / 2) {
        currentPage = Math.max(0, currentPage - 1);
    } else if (currentPage < lastPageIndex) {
        currentPage = Math.min(lastPageIndex, currentPage + 1);
    }
    updateMobilePages();  // 수정: 조건문 밖으로 이동하여 모든 경우에 업데이트 실행
}

// 모바일 페이지 업데이트
function updateMobilePages() {
    rightImage.src = images[currentPage];
    const pageInput = pageCounter.querySelector('input');
    if (pageInput) {
        pageInput.value = currentPage + 1;
    }
    updateActiveBookmark();
}

const handleClick = (e) => {
    if (!e.target.closest('.bookmark')) {
        if (isMobile()) {
            handleMobilePageClick(e);
        } else {
            if (currentPage % 2 !== 0) {
                currentPage++;
            }
            handlePageNavigation(e);
        }
    }
};

const handleKeydown = (event) => {
    if (!isMobile()) {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            if (currentPage % 2 !== 0 && event.key === 'ArrowRight') {
                currentPage++;
            }
            handleDesktopKeyPress(event);
        }
    }
};

function initEventListeners() {
    leftPage.removeEventListener('click', handleClick);
    rightPage.removeEventListener('click', handleClick);
    document.removeEventListener('keydown', handleKeydown);

    leftPage.addEventListener('click', handleClick);
    rightPage.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);

    if (isMobile()) {
        const bookmarkContainer = document.querySelector('.bookmark-container');
        if (bookmarkContainer) {
            bookmarkContainer.style.display = 'none';
            bookmarkContainer.style.visibility = 'hidden';
            bookmarkContainer.style.opacity = '0';
        }
    }
}

function init() {
    window.addEventListener('resize', initEventListeners);
    preloadImages();
    initEventListeners();
    updatePageCounter();
    updatePages();
}

init();