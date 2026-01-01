$(document).ready(function() {
	var add_files_flag = true;
	$('#update_file_button').click(function() {
		$('.update_file').each(function() {
			$(this).removeAttr('style')
		});
	});

	$('.update_file input').click(function() {
		add_files_flag = false;
		phpbb.plupload.updateMultipartParams({ update_file: $(this).attr('value') });

		$('#add_files').removeClass('disabled');
		$('#add_files').removeAttr('disabled');

		$('#add_files').click();

		$('#add_files').addClass('disabled');
		$('#add_files').attr('disabled', 'disabled');
	});
		
	phpbb.plupload.uploader.bind('FilesAdded', function (up, files) {
		if ($('input[type="radio"][name="update_file"]:checked').length > 0)
		{
			var i = files.length;

			if (i > 1) {
				plupload.each(files, function (file) {
					up.removeFile(file);
				});
					
				$('.attach-row').each(function() {
					if (typeof $(this).attr('data-attach-id') === 'undefined') {
						$(this).remove();
					}
				});
					
				$('input[type="radio"][name="update_file"]').each(function(){
					$(this).prop('checked', false);
					//$(this).parent().attr('style', 'display: none;');
				});
				add_files_flag = true;
				phpbb.plupload.updateMultipartParams({ update_file: 0 });

				phpbb.alert(updateatt.lang.INFORMATION, updateatt.lang.UPDATE_TOO_MANY_ATTACHMENTS );
			}
		}
	});
		
	$('#add_files').click(function() {
		if (add_files_flag)
		{
			$('input[type="radio"][name="update_file"]').each(function(){
				$(this).prop('checked', false);
				$(this).parent().attr('style', 'display: none;');
			});
			phpbb.plupload.updateMultipartParams({ update_file: 0 });
		}
	});
		
	phpbb.plupload.uploader.bind('UploadComplete', function(up, file) {
		function updateBbcode(filename_old, filename_new, index_flag) {
			var	textarea = $('#message', phpbb.plupload.form),
				text = textarea.val();

			// Return if the bbcode isn't used at all.
			if (text.indexOf('[attachment=') === -1) {
				return;
			}

			function runUpdate(i, filename_old, filename_new, index_flag) {
				var regex = new RegExp('\\[attachment=' + i + '\\](.*?)\\[\\/attachment\\]', 'g');
				text = text.replace(regex, function updateBbcode(_, fileName) {
					// Remove the bbcode if the file was removed.
					var newIndex = i - 1;
					if (fileName == filename_old || (index_flag && newIndex == 0)) {
						fileName = filename_new;
					}
					return '[attachment=' + newIndex + ']' + fileName + '[/attachment]';
				});
			}

			// Loop forwards when removing and backwards when adding ensures we don't
			// corrupt the bbcode index.
			var i;
			for (i = 0; i < phpbb.plupload.ids.length + 1; i++) {
				runUpdate(i, filename_old, filename_new, index_flag);
			}

			textarea.val(text);
		};
		
		function pai_ext($update_row, file, index, first) {
			if (typeof pai_extensions !== 'undefined') {
				var url = $update_row.find('.file-name a').attr('href').replace('&amp;', '&'),
					link = $('<a></a>');

				var filename = file[index].name;
				if (first) {
					filename = file[0].attachment_data.real_filename;
				}
				
				if (filename.match(pai_extensions)) {
					if (data_lightbox) {
						link.attr('data-lightbox', 'post-gallery');
					} else {
						link.attr('onclick', onclick_event);
					}

					if (data_hs) {
						link.addClass('highslide');
					}

					link.attr('href', url).html("<img src='" + url + "&v=" + Date.now() + "' style='max-width: " + pai_max_width + "px; max-height: " + pai_max_height + "px;' alt='" + filename + "' />");
					$update_row.find('.file-name').html(link);
				}
			}
		}

		if ($('input[type="radio"][name="update_file"]:checked').length > 0)
		{
			$('#add_files').removeClass('disabled');
			$('#add_files').removeAttr('disabled');
			
			if (typeof file[0] !== 'undefined') {
				var index = file.length - 1;
				if (file[index].status === plupload.DONE) { 

					$('.attach-row[id="' + file[index].id + '"]').slideUp(100, function() {
						$('.attach-row[id="' + file[index].id + '"]').remove();
						
						// Fix first row url
						var first_url = $('#file-list .attach-row:first-child .file-name a').attr('href').replace('&amp;', '&'),
							first_attach_id = first_url.split('id=')[1];

						first_url = first_url.replace(first_attach_id, file[0].attachment_data.attach_id);
						$('#file-list .attach-row:first-child .file-name a').attr('href', first_url);

						pai_ext($('#file-list .attach-row:first-child'), file, 0, true);
					});

					// Update selected row
					var update_row = $('input[type="radio"][name="update_file"]:checked').parents('.attach-row')[0];
					
					var index_flag = false;
					if (file.length == 1) {
						var index_flag = true;
					}

					var filename_old = $(update_row).find('.file-name a').html();
					if (typeof pai_extensions !== 'undefined') {
						if (filename_old.includes('<img ')) {
							filename_old = $(update_row).find('.file-name a img').attr('alt');
						}
					}
					
					updateBbcode(filename_old, file[index].name, index_flag);

					$(update_row).find('.file-name a').html(file[index].name);
					$(update_row).find('.file-size').html(plupload.formatSize(file[index].size));
					
					pai_ext($(update_row), file, index, false);
				}
			}

			$('input[type="radio"][name="update_file"]').each(function(){
				$(this).prop('checked', false);
				$(this).parent().attr('style', 'display: none;');
			});
			add_files_flag = true;
			phpbb.plupload.updateMultipartParams({ update_file: 0 });
		}
	});
});