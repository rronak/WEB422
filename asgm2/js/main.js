// WEB422 – Assignment 2 
// By submitting this code, I declare that this assignment is my own work in accordance with Seneca's 
// Academic Integrity Policy: https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
// Name: Ronak Jung Rayamajhi
// Student ID: 146857230
// Date: 2025-05-31

let page = 1;
const perPage = 10;
let searchName = null;

const listingsTableBody = document.querySelector("#listingsTable tbody");
const currentPageEl = document.getElementById("current-page");

function loadListingsData() {
  let url = `https://web422ronak.vercel.app/api/listings?page=${page}&perPage=${perPage}`;
  if (searchName) {
    url += `&name=${encodeURIComponent(searchName)}`;
  }

  fetch(url)
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => {
      listingsTableBody.innerHTML = "";
      if (data.length === 0) {
        if (page > 1) {
          page--;
          loadListingsData();
        } else {
          listingsTableBody.innerHTML = `<tr><td colspan="4"><strong>No data available</strong></td></tr>`;
        }
        return;
      }

      currentPageEl.textContent = page;

      listingsTableBody.innerHTML = data.map(listing => `
        <tr data-id="${listing._id}">
          <td>${listing.name || "N/A"}</td>
          <td>${listing.room_type || "N/A"}</td>
          <td>${listing.address?.street || "N/A"}</td>
          <td>${listing.summary || "N/A"}<br><br>
            <strong>Accommodates:</strong> ${listing.accommodates || "?"}<br>
            <strong>Rating:</strong> ${listing.review_scores?.review_scores_rating || "?"}
            (${listing.number_of_reviews || 0} Reviews)
          </td>
        </tr>`).join("");

      document.querySelectorAll("#listingsTable tbody tr").forEach(row => {
        row.addEventListener("click", () => {
          const id = row.getAttribute("data-id");
          fetch(`https://web422ronak.vercel.app/api/listings/${id}`)
            .then(res => res.json())
            .then(listing => {
              document.querySelector(".modal-title").textContent = listing.name;
              document.querySelector(".modal-body").innerHTML = `
                <img class="img-fluid w-100 mb-3" src="${listing.images?.picture_url}" 
                  onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=No+Image'" />
                ${listing.neighborhood_overview || "No description"}<br><br>
                <strong>Price:</strong> $${(listing.price || 0).toFixed(2)}<br>
                <strong>Room:</strong> ${listing.room_type}<br>
                <strong>Bed:</strong> ${listing.bed_type} (${listing.beds})<br>
              `;
              const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
              modal.show();
            });
        });
      });
    })
    .catch(() => {
      listingsTableBody.innerHTML = `<tr><td colspan="4"><strong>Error loading data</strong></td></tr>`;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadListingsData();

  document.getElementById("previous-page").addEventListener("click", e => {
    e.preventDefault();
    if (page > 1) {
      page--;
      loadListingsData();
    }
  });

  document.getElementById("next-page").addEventListener("click", e => {
    e.preventDefault();
    page++;
    loadListingsData();
  });

  document.getElementById("searchForm").addEventListener("submit", e => {
    e.preventDefault();
    searchName = document.getElementById("name").value.trim();
    page = 1;
    loadListingsData();
  });

  document.getElementById("clearForm").addEventListener("click", () => {
    document.getElementById("name").value = "";
    searchName = null;
    page = 1;
    loadListingsData();
  });
});
