# ddc-shell-history

Shell history completion for ddc.vim

This source collects candidates from histories in your `$SHELL`.

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### ddc.vim

https://github.com/Shougo/ddc.vim

## Configuration

```vim
" Use shell-history source.
call ddc#custom#patch_global('sources', ['shell-history'])

" Change source options
call ddc#custom#patch_global('sourceOptions', {
      \ 'shell-history': {
      \   'mark': 'S',
      \   'minKeywordLength': 4,
      \   'maxKeywordLength': 50,
      \ },
      \ })
```
