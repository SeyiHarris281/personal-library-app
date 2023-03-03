$(document).ready(function () {

  let itemsRaw = [];

  $.getJSON('/api/books', function(data) {
    itemsRaw = JSON.parse(JSON.stringify(data));
    if (data.length > 0) {
      updateBookListDisplay(0, 9, data);
    }
    
  });

  $("button#submitNewBook").click(function() {
    $.ajax({
      url: '/api/books',
      type: 'post',
      datatype: 'json',
      data: $('#newBookForm').serialize(),
      success: function (data) {
        // update book list display
        if (typeof data !== 'string') {
          itemsRaw.push({ ...data, commentcount: 0 });
          updateBookListDisplay(0, 9, itemsRaw);
          $('#newBookTitle').val('');
        }
        
      }
    });
  });

  $('#bookListDisplay').on('click', 'li.bookitem', function() {
    $.getJSON(`/api/books/${(this).id}`, function(data) {
      updateBookDisplay(data);
    });
  });

  $('#bookListFooter').on('click', 'button#deleteAllBooks', function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      success: function(data) {
        $('#bookListDisplay').html(`<p class="card-text">Enter new book into library</p>`);
        $('#bookCount').html('');
      }
    });
  });

  $('#bookListDisplay').on('click', 'a.changeBookSet', function() {
    updateBookListDisplay(+this.dataset.start, +this.dataset.finish, itemsRaw);
  });

  $('#commentsDisplay').on('click', 'button#addComment',function() {
    $.ajax({
      url: `/api/books/${this.dataset.id}`,
      type: 'post',
      datatype: 'json',
      data: $('#commentForm').serialize(),
      success: function(data) {
        if(typeof data !== 'string') {
          updateBookDisplay(data);
          $(`li#${data._id}`).html(`${data.title} - ${data.commentcount} comments`);
        }
      }
    });
    
  });

  $('#commentsDisplay').on('click', 'button#deleteBook', function() {
    $.ajax({
      url: `api/books/${this.dataset.id}`,
      type: 'delete',
      success: function() {
        $.getJSON('/api/books', function(data) {
          itemsRaw = JSON.parse(JSON.stringify(data));
          updateBookListDisplay(0, 9, data);
          
          $('#bookTitle').html(`Title`);
          $('#bookID').html(`(id:)`);
          $('#commentsDisplay').html('Click on book to display it\'s comments.');
        });
      }
    });
  });

  function updateBookListDisplay(start, finish, booksArray) {
    if(booksArray.length > 0) {
      
      let bookItems = [];
      let fin = Math.min(finish, booksArray.length - 1);
      
      for (let i = start; i <= fin; ++i) {
        bookItems.push(`<li class="bookitem" id="${booksArray[i]._id}">${booksArray[i].title} - ${booksArray[i].commentcount} comments</li>`);
      }
  
      $('#bookListDisplay').empty();
  
      $('<ul/>', {
        'class': 'listWrapper',
        html: bookItems.join('')
      }).appendTo('#bookListDisplay');
  
      $('#bookCount').html(`${booksArray.length} book(s)`);
  
      if (start !== 0) {
        let prevStart = start - 10;
        let prevFinish = prevStart + 9;
        let prevBooks = `<a class="card-link changeBookSet" id="prevBooks" data-start="${prevStart}" data-finish="${prevFinish}" href="#">\< prev</a>`;
        $('#bookListDisplay').append(prevBooks);
      }
  
      if (fin < (booksArray.length - 1)) {
        let nextStart = fin + 1;
        let nextFinish = Math.min(nextStart + 9, booksArray.length - 1);
        let moreBooks = `<a class="card-link changeBookSet" id="nextBooks" data-start="${nextStart}" data-finish="${nextFinish}" href="#">next \></a>`;
        $('#bookListDisplay').append(moreBooks);
      }
      
    } else {
      $('#bookListDisplay').html(`<p class="card-text">Enter new book into library</p>`);
      $('#bookCount').html('');
    }
    
  }

  function updateBookDisplay(data) {
    $('#bookTitle').html(`${data.title}`);
    $('#bookID').html(`id: ${data._id}`)
    
    let comments = [];
    
    comments.push('<ol>');
    $.each(data.comments, (i, val) => {
      comments.push(`<li>${val}</li>`);
    });
    comments.push('</ol>');
    let bookControls = [
      `<div class="container">`,
      `<form class="container border" id="commentForm">`,
      `<div class="row"><div class="col">`,
      `<input type="text" class="form-control" name="comment" placeholder="Enter new comment">`,
      `</div></div></form>`,
      `<div class="d-flex justify-content-around">`,
      `<button class="btn btn-outline-primary" id="addComment" data-id="${data._id}">Add Comment</button>`,
      `<button class="btn btn-outline-danger" id="deleteBook" data-id="${data._id}">Delete Book</button>`,
      `</div></div>`
    ];
    $('#commentsDisplay').html(comments.join(''));
    $('#commentsDisplay').append(bookControls.join(''));
  }

  
});